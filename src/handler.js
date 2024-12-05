const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: 'ap-southeast-2' });

module.exports.generatePDF = async event => {
	let browser = null;
	let page = null;
	try {
		const browser = await puppeteer.launch({
			args: chromium.args,
			defaultViewport: chromium.defaultViewport,
			executablePath: await chromium.executablePath(),
			headless: chromium.headless,
		});

		page = await browser.newPage();
		await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });

		const buffer = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });

		const params = {
			Bucket: 'pdf-service-bucket-241205',
			Key: 'example.pdf',
			Body: buffer,
			ContentType: 'application/pdf',
		};

		const command = new PutObjectCommand(params);
		await s3.send(command);

		return {
			statusCode: 200,
			body: JSON.stringify(
				{
					result: 'passed',
					input: event,
				},
				null,
				2,
			),
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ error: error.message }),
		};
	} finally {
		if (page) {
			await page.close();
		}
		if (browser) {
			await browser.close();
		}
	}
};
