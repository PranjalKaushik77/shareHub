// DOM elements
const retrieveForm = document.getElementById("retrieve-form")
const urlInput = document.getElementById("url-input")
const contentContainer = document.getElementById("content-container")
const loadingIndicator = document.getElementById("loading-indicator")

// Event listeners
retrieveForm.addEventListener("submit", retrieveContent)

// Retrieve content
async function retrieveContent(e) {
  e.preventDefault()

  const url = urlInput.value.trim()

  if (!url) {
    alert("Please enter a valid URL.")
    return
  }

  // Show loading indicator
  loadingIndicator.style.display = "block"
  contentContainer.innerHTML = ""

  try {
    // Check if it's a Cloudinary URL
    if (url.includes("cloudinary.com")) {
      await handleCloudinaryUrl(url)
    } else {
      throw new Error("Invalid URL. Please provide a valid Cloudinary URL.")
    }
  } catch (error) {
    console.error("Error retrieving content:", error)
    contentContainer.innerHTML = `<div class="error-message">Error: ${error.message}</div>`
  } finally {
    // Hide loading indicator
    loadingIndicator.style.display = "none"
  }
}

// Handle Cloudinary URL
async function handleCloudinaryUrl(url) {
  // Extract file extension from URL
  const fileExtension = url.split(".").pop().toLowerCase()

  // Handle different file types
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
    // Image file
    displayImage(url)
  } else if (["mp4", "webm", "mov"].includes(fileExtension)) {
    // Video file
    displayVideo(url)
  } else if (["mp3", "wav", "ogg"].includes(fileExtension)) {
    // Audio file
    displayAudio(url)
  } else if (["pdf"].includes(fileExtension)) {
    // PDF file
    displayPdf(url)
  } else if (["txt"].includes(fileExtension)) {
    // Text file
    await displayTextFile(url)
  } else {
    // Other file types - provide download link
    displayDownloadLink(url)
  }
}

// Display image
function displayImage(url) {
  const img = document.createElement("img")
  img.src = url
  img.alt = "Shared Image"
  img.className = "shared-image"

  contentContainer.innerHTML = ""
  contentContainer.appendChild(img)

  // Add download button
  addDownloadButton(url)
}

// Display video
function displayVideo(url) {
  const video = document.createElement("video")
  video.src = url
  video.controls = true
  video.autoplay = false
  video.className = "shared-video"

  contentContainer.innerHTML = ""
  contentContainer.appendChild(video)

  // Add download button
  addDownloadButton(url)
}

// Display audio
function displayAudio(url) {
  const audio = document.createElement("audio")
  audio.src = url
  audio.controls = true
  audio.autoplay = false
  audio.className = "shared-audio"

  contentContainer.innerHTML = ""
  contentContainer.appendChild(audio)

  // Add download button
  addDownloadButton(url)
}

// Display PDF
function displayPdf(url) {
  const iframe = document.createElement("iframe")
  iframe.src = url
  iframe.className = "shared-pdf"

  contentContainer.innerHTML = ""
  contentContainer.appendChild(iframe)

  // Add download button
  addDownloadButton(url)
}

// Display text file
async function displayTextFile(url) {
  try {
    const response = await fetch(url)
    const text = await response.text()

    const pre = document.createElement("pre")
    pre.className = "shared-text"
    pre.textContent = text

    contentContainer.innerHTML = ""
    contentContainer.appendChild(pre)

    // Add download button
    addDownloadButton(url)
  } catch (error) {
    throw new Error("Failed to load text content: " + error.message)
  }
}

// Display download link
function displayDownloadLink(url) {
  const fileName = url.split("/").pop()

  const downloadLink = document.createElement("a")
  downloadLink.href = url
  downloadLink.download = fileName
  downloadLink.className = "download-link"
  downloadLink.textContent = `Download ${fileName}`

  contentContainer.innerHTML = "<h3>File Ready for Download</h3>"
  contentContainer.appendChild(downloadLink)
}

// Add download button
function addDownloadButton(url) {
  const fileName = url.split("/").pop()

  const downloadButton = document.createElement("a")
  downloadButton.href = url
  downloadButton.download = fileName
  downloadButton.className = "download-button"
  downloadButton.textContent = "Download"

  contentContainer.appendChild(downloadButton)
}

