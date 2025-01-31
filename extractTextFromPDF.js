const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = './path/to/your/resume.pdf'; // Update this path to your PDF file

const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    console.log('Extracted Text:', data.text);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

extractTextFromPDF(pdfPath);
