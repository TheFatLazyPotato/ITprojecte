const imageInput = document.querySelector("#fileInput");
let uploadedImage = "";

imageInput.addEventListener("change", function () {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        uploadedImage = reader.result;
        document.querySelector("#display-input").style.backgroundImage = `url(${uploadedImage})`
    })
    reader.readAsDataURL(this.files[0])
})