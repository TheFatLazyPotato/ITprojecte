async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const statusDiv = document.getElementById('status');

    // Check if a file has been selected
    if (fileInput.files.length === 0) {
        statusDiv.innerText = 'Please select a file.';
        return;
    }

    const file = fileInput.files[0];

    // Prepare the form data
    const formData = new FormData();
    formData.append('file', file);

    try {
        // Make the request to the server
        const response = await fetch('https://your-server-url/upload', {
            method: 'POST',
            body: formData
        });

        // Check if upload was successful
        if (response.ok) {
            const result = await response.json();
            statusDiv.innerText = `File uploaded successfully: ${result.filePath}`;
        } else {
            statusDiv.innerText = `Upload failed with status: ${response.status}`;
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        statusDiv.innerText = 'Error uploading file.';
    }
}
