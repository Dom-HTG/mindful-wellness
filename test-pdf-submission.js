const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log("Launching headless browser...");
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Listen to browser console and errors
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('requestfailed', req => console.log(`REQUEST FAILED: ${req.url()} (${req.failure()?.errorText})`));
  
  // Enable request interception to mock FormSubmit endpoint posts and avoid rate limiting
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.url().includes('formsubmit.co')) {
      console.log('MOCKING FormSubmit request:', request.url());
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: "true", message: "Mocked successful FormSubmit relay" })
      });
    } else {
      request.continue();
    }
  });

  // Set viewport to 1200x800
  await page.setViewport({ width: 1200, height: 800 });

  console.log("Navigating to clinic home page...");
  await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'networkidle2' });

  console.log("Opening Booking Modal...");
  await page.evaluate(() => {
    const btn = document.querySelector('button[onclick*="openBookingModal"]') || 
                Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Book Consultation'));
    if (btn) btn.click();
    else throw new Error("Could not find openBookingModal button");
  });

  await delay(1000);

  console.log("Clicking Auto-Fill Demo...");
  await page.evaluate(() => {
    const btn = document.querySelector('button[onclick*="autoFillDemoData"]') || 
                Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Auto-Fill Demo'));
    if (btn) btn.click();
    else throw new Error("Could not find Auto-Fill Demo button");
  });

  await delay(1500);

  console.log("Progressing programmatically to step 2...");
  await page.evaluate(() => {
    goToBookingStep(2);
  });
  await delay(1000);

  console.log("Progressing programmatically to step 3...");
  await page.evaluate(() => {
    goToBookingStep(3);
  });
  await delay(1000);

  console.log("Progressing programmatically to step 4...");
  await page.evaluate(() => {
    goToBookingStep(4);
  });
  await delay(1000);

  console.log("Submitting Consultation request (Step 4)...");
  await page.evaluate(() => {
    const btn = document.getElementById('submit-booking-btn') || document.querySelector('button[type="submit"]');
    if (btn) btn.click();
    else throw new Error("Could not find submit button");
  });

  console.log("Waiting for booking modal to close...");
  try {
    await page.waitForSelector('#booking-modal.hidden', { timeout: 20000 });
    console.log("Booking modal closed successfully!");
  } catch (err) {
    console.log("Selector wait failed or timed out. Dumping layout state...");
    const dump = await page.evaluate(() => {
      const modal = document.getElementById('booking-modal');
      const container = document.getElementById('modal-container');
      const formView = document.getElementById('modal-form-view');
      const successView = document.getElementById('modal-success-view');
      
      const getStyles = el => {
        if (!el) return 'NOT_FOUND';
        const style = window.getComputedStyle(el);
        return `class="${el.className}" display="${style.display}" visibility="${style.visibility}" opacity="${style.opacity}" width="${el.getBoundingClientRect().width}" height="${el.getBoundingClientRect().height}"`;
      };
      
      return {
        bookingModal: getStyles(modal),
        modalContainer: getStyles(container),
        modalFormView: getStyles(formView),
        modalSuccessView: getStyles(successView)
      };
    });
    console.log("DUMPED STATE:", dump);
    
    // Save screenshot
    await page.screenshot({ path: 'error_screenshot.png' });
    console.log("Saved error_screenshot.png for inspection.");
    throw err;
  }

  await delay(3000);

  console.log("Directly compiling PDF blob in page memory to verify size...");
  const pdfDetails = await page.evaluate(async () => {
    const pdfElement = document.getElementById('pdf-printout-template');

    const opt = {
      margin:       0,
      image:        { type: 'jpeg', quality: 0.95 },
      html2canvas:  { scale: 1, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    try {
      const pdfBlob = await html2pdf().set(opt).from(pdfElement).outputPdf('blob');
      
      const nameVal = document.getElementById('pdf-s1-name-val')?.textContent || 'MISSING';
      const patientSigBox = document.getElementById('pdf-s1-patient-sig-box')?.innerHTML || 'EMPTY';
      return {
        size: pdfBlob.size,
        htmlLength: pdfElement.innerHTML.length,
        nameVal: nameVal,
        patientSigBox: patientSigBox
      };
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log("GENERATED PDF IN-MEMORY BLOB DETAILS:", pdfDetails);

  // Since we no longer download the PDF locally, we assert the in-memory size is > 100KB and close the browser.
  if (pdfDetails && pdfDetails.size > 100000) {
    console.log(`\n==================================================`);
    console.log(`SUCCESS! PDF successfully generated in memory for transmission:`);
    console.log(`In-Memory PDF Size: ${pdfDetails.size} bytes`);
    console.log(`Template HTML Length: ${pdfDetails.htmlLength} chars`);
    console.log(`==================================================\n`);
  } else {
    console.log("\n==================================================");
    console.log("FAILURE! Generated PDF size is incorrect or failed to compile.");
    console.log("==================================================\n");
    process.exit(1);
  }

  await browser.close();
})();
