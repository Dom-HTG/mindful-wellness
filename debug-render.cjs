const puppeteer = require("puppeteer-core");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  const errors = [];
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("CONSOLE: " + m.text());
  });

  await page.goto("http://localhost:4173/", { waitUntil: "networkidle0", timeout: 30000 });

  const info = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const h1 = document.querySelector("h1");
    const h2 = document.querySelector("h2");
    const primaryBtn = [...document.querySelectorAll("a,button")].find(
      (el) => el.textContent && el.textContent.includes("Book a Free Consultation"),
    );
    const header = document.querySelector("header");
    return {
      bodyBg: body.backgroundColor,
      bodyColor: body.color,
      bodyFont: body.fontFamily,
      h1Text: h1 ? h1.textContent.trim() : null,
      h1Font: h1 ? getComputedStyle(h1).fontFamily : null,
      h1Color: h1 ? getComputedStyle(h1).color : null,
      h2Text: h2 ? h2.textContent.trim() : null,
      primaryBtnBg: primaryBtn ? getComputedStyle(primaryBtn).backgroundColor : null,
      primaryBtnColor: primaryBtn ? getComputedStyle(primaryBtn).color : null,
      headerBg: header ? getComputedStyle(header).backgroundColor : null,
      htmlHasContent: document.body.innerText.length,
    };
  });

  console.log(JSON.stringify(info, null, 2));
  console.log("ERRORS:", errors.length ? errors.join(" | ") : "none");
  await browser.close();
})();
