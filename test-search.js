// Simple test script to verify search functionality
const fetch = require('node-fetch');

async function testSearch() {
  try {
    console.log('Testing search API...');

    // Test 1: Get all documents
    console.log('\n1. Getting all documents...');
    const allDocsResponse = await fetch('http://localhost:3003/api/upload');
    const allDocs = await allDocsResponse.json();
    console.log('Documents found:', allDocs.documents?.length || 0);

    // Test 2: Search for "document"
    console.log('\n2. Searching for "document"...');
    const searchResponse = await fetch('http://localhost:3003/api/search?q=document');
    const searchResults = await searchResponse.json();
    console.log('Search results:', searchResults);

    // Test 3: Search for "sample"
    console.log('\n3. Searching for "sample"...');
    const sampleResponse = await fetch('http://localhost:3003/api/search?q=sample');
    const sampleResults = await sampleResponse.json();
    console.log('Sample search results:', sampleResults);

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testSearch();
