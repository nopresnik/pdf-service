export const generatePDF = async event => {
	return {
		statusCode: 200,
		body: JSON.stringify({
			message: 'Hello from Lambda!',
			input: event,
		}),
	};
};
