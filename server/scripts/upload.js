const form = document.querySelector("#uploadForm");
//const preview = document.getElementById('preview');
const fileInput = document.getElementById('fileInput');
//const applyButton = document.getElementById('filterButton');

async function uploadFile() {
    
	/*
    // Check if a file has been selected
    if (fileInput.files.length === 0) {
        console.warn("Please select a file.");
        return;
    }

    const file = fileInput.files[0];
	
    // Prepare the form data
    formData.append('file', file);
	*/
	
	const formData = new FormData(form);

    try {
        // Make the request to the server
        const response = await fetch(String("/sendFile"), {
            method: "POST",
            body: formData
        });

        // Check if upload was successful
        if (response.ok) {
            const result = await response.json();
            console.log(`File uploaded successfully: ${result.filePath}`);
        } else {
            console.error(`Upload failed with status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}



/*
applyButton.addEventListener("onclick", (event) =>
{
    console.error("clicke");
    event.preventDefault();
    applyFilters();
});
*/

// Wait for form submit
form.addEventListener("submit", (event) =>
{
	event.preventDefault();
	uploadFile();
});

// Wait for image selection
fileInput.addEventListener('change', (event) => {
	const file = event.target.files[0];
	if (file) {
		const fileURL = URL.createObjectURL(file);

		preview.src = fileURL;

		preview.style.display = 'block';
  }
});