import puppeteer from "puppeteer";
import axios from "axios";
import * as cheerio from "cheerio";

export interface RawLead {
  importer: string;
  cnee?: string;
  commodity?: string;
  hsCode?: string;
  origin?: string;
  destination?: string;
  lastShipmentDate?: string;
  weight?: string;
  containerCount?: string;
  source: string;
  url?: string;
}

export class ShipmentScraper {
  
  // Scrape public manifest sites (example: ImportYeti)
  static async scrapeImportYeti(query: string): Promise<RawLead[]> {
    const url = `https://www.importyeti.com/search?q=${encodeURIComponent(query)}`;
    const leads: RawLead[] = [];

    const resp = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(resp.data);

    $(".company-result").each((i, el) => {
      leads.push({
        importer: $(el).find(".company-name").text().trim(),
        commodity: $(el).find(".product-list").text().trim(),
        source: "ImportYeti",
        url
      });
    });

    return leads;
  }


  // Scrape trade directories (example: alibaba buyer list)
  static async scrapeAlibabaBuyers(keyword: string): Promise<RawLead[]> {
    const url = `https://www.alibaba.com/trade/search?keywords=${encodeURIComponent(keyword)}`;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.content();
    const $ = cheerio.load(html);

    const leads: RawLead[] = [];

    $(".supplier-card").each((i, el) => {
      leads.push({
        importer: $(el).find(".supplier-name").text().trim(),
        commodity: keyword,
        source: "Alibaba Buyers",
        url
      });
    });

    await browser.close();
    return leads;
  }


  // Foreign customs API (India example)
  static async scrapeIndianHSCode(hs: string): Promise<RawLead[]> {
    const url = `https://api.cbic-gov.in/public/hs?code=${hs}`;
    const leads: RawLead[] = [];

    try {
      const resp = await axios.get(url);
      const data = resp.data.records || [];

      data.forEach((item: any) => {
        leads.push({
          importer: item.importer || "",
          hsCode: hs,
          origin: item.country,
          lastShipmentDate: item.date,
          source: "India Customs API"
        });
      });
    } catch {}

    return leads;
  }


  // Port schedule (example: Port of LA API)
  static async scrapePortOfLA(): Promise<RawLead[]> {
    const url = "https://www.portoflosangeles.org/api/vessel_schedule";
    const leads: RawLead[] = [];

    try {
      const resp = await axios.get(url);
      resp.data.forEach((v: any) => {
        leads.push({
          importer: "",
          commodity: "",
          origin: v.lastPort,
          destination: "Los Angeles",
          lastShipmentDate: v.arrival,
          source: "Port of LA"
        });
      });
    } catch {}

    return leads;
  }

}
