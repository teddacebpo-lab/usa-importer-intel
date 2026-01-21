
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const url = `https://portexaminer.com/search.php?search-field-1=consignee&search-term-1=${encodeURIComponent(query as string)}`;
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const results: any[] = [];

    $('.search-results-table tr').slice(1).each((_, el) => {
      const cols = $(el).find('td');
      if (cols.length >= 4) {
        results.push({
          date: $(cols[0]).text().trim(),
          consignee: $(cols[1]).text().trim(),
          shipper: $(cols[2]).text().trim(),
          commodity: $(cols[3]).text().trim()
        });
      }
    });

    res.status(200).json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
