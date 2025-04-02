import cloudinaryConfig from "./config.js"
import { supabaseConfig } from "./config.js"
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm'

// Then initialize Supabase

// Event listeners
const supabase = createClient(
  'SUPABASE_URL', // Replace with your Supabase URL
  'SUPABASE_ANON_KEY' // Replace with your Supabase anon key
);
// DOM elements
const dropArea = document.getElementById("drop-area")
const fileElem = document.getElementById("fileElem")
const fileList = document.getElementById("file-list")
const uploadProgress = document.getElementById("upload-progress")
const progressBar = document.getElementById("progress-bar")
const uploadedFiles = document.getElementById("uploaded-files")
const uploadButton = document.getElementById("upload-button")

;["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefaults, false)
})
;["dragenter", "dragover"].forEach((eventName) => {
  dropArea.addEventListener(eventName, highlight, false)
})
;["dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, unhighlight, false)
})

dropArea.addEventListener("drop", handleDrop, false)
fileElem.addEventListener("change", handleFiles, false)
uploadButton.addEventListener("click", uploadFiles, false)

// Prevent default behaviors
function preventDefaults(e) {
  e.preventDefault()
  e.stopPropagation()
}

// Highlight drop area
function highlight() {
  dropArea.classList.add("highlight")
}

// Remove highlight
function unhighlight() {
  dropArea.classList.remove("highlight")
}

// Handle dropped files
function handleDrop(e) {
  const dt = e.dataTransfer
  const files = dt.files
  handleFiles(files)
}

// Selected files array
let selectedFiles = []

// Handle selected files
function handleFiles(e) {
  const files = e.target?.files || e
  updateFileList(files)
}

// Update file list UI
function updateFileList(files) {
  fileList.innerHTML = ""
  selectedFiles = Array.from(files)

  selectedFiles.forEach((file, index) => {
    const fileItem = document.createElement("div")
    fileItem.className = "file-item"

    const fileName = document.createElement("span")
    fileName.textContent = file.name

    const fileSize = document.createElement("span")
    fileSize.className = "file-size"
    fileSize.textContent = formatFileSize(file.size)

    const removeButton = document.createElement("button")
    removeButton.textContent = "Remove"
    removeButton.className = "remove-button"
    removeButton.onclick = () => removeFile(index)

    fileItem.appendChild(fileName)
    fileItem.appendChild(fileSize)
    fileItem.appendChild(removeButton)
    fileList.appendChild(fileItem)
  })

  if (selectedFiles.length > 0) {
    uploadButton.disabled = false
  } else {
    uploadButton.disabled = true
  }
}

// Remove file from selection
function removeFile(index) {
  selectedFiles.splice(index, 1)
  updateFileList(selectedFiles)
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Upload files to Cloudinary
async function uploadFiles() {
  if (selectedFiles.length === 0) return

  uploadProgress.style.display = "block"
  progressBar.style.width = "0%"
  uploadedFiles.innerHTML = ""

  const totalFiles = selectedFiles.length
  let uploadedCount = 0
  const uploadedOtps = []

  for (const file of selectedFiles) {
    try {
      const url = await uploadToCloudinary(file, (progress) => {
        const totalProgress = ((uploadedCount + progress / 100) / totalFiles) * 100
        progressBar.style.width = totalProgress + "%"
      })

      // Generate 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString()
      
      // Store in Supabase
      const { error } = await supabase
        .from('files')
        .insert([{ otp, url }])

      if (error) throw error

      uploadedOtps.push({ name: file.name, otp })
      uploadedCount++
    } catch (error) {
      console.error("Error uploading file:", error)
      alert(`Failed to upload ${file.name}: ${error.message}`)
    }
  }

  // Update UI with OTPs
  displayUploadedOtps(uploadedOtps)

  // Reset selected files
  selectedFiles = []
  fileList.innerHTML = ""
  uploadButton.disabled = true
}
function displayUploadedOtps(files) {
  uploadedFiles.innerHTML = "<h3>Uploaded Files - Share these OTPs</h3>"

  files.forEach((file) => {
    const fileItem = document.createElement("div")
    fileItem.className = "uploaded-file-item"

    const fileName = document.createElement("div")
    fileName.textContent = file.name
    fileName.className = "file-name"

    const otpDisplay = document.createElement("div")
    otpDisplay.className = "otp-display"
    otpDisplay.innerHTML = `
      <strong>OTP:</strong> ${file.otp}
      <button class="copy-otp">Copy</button>
    `

    otpDisplay.querySelector(".copy-otp").onclick = () => {
      navigator.clipboard.writeText(file.otp)
      otpDisplay.querySelector(".copy-otp").textContent = "Copied!"
      setTimeout(() => {
        otpDisplay.querySelector(".copy-otp").textContent = "Copy"
      }, 2000)
    }

    fileItem.appendChild(fileName)
    fileItem.appendChild(otpDisplay)
    uploadedFiles.appendChild(fileItem)
  })
}

// Upload a single file to Cloudinary
function uploadToCloudinary(file, progressCallback) {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", cloudinaryConfig.uploadPreset)

    const xhr = new XMLHttpRequest()
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`, true)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100
        progressCallback(progress)
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText)
        resolve(response.secure_url)
      } else {
        reject(new Error("Upload failed"))
      }
    }

    xhr.onerror = () => {
      reject(new Error("Network error"))
    }

    xhr.send(formData)
  })
}

// Display uploaded files with share links
function displayUploadedFiles(files) {
  uploadedFiles.innerHTML = "<h3>Uploaded Files</h3>"

  files.forEach((file) => {
    const fileItem = document.createElement("div")
    fileItem.className = "uploaded-file-item"

    const fileLink = document.createElement("a")
    fileLink.href = file.url
    fileLink.textContent = file.name
    fileLink.target = "_blank"

    const shareLink = document.createElement("div")
    shareLink.className = "share-link"

    const linkInput = document.createElement("input")
    linkInput.type = "text"
    linkInput.value = file.url
    linkInput.readOnly = true

    const copyButton = document.createElement("button")
    copyButton.textContent = "Copy"
    copyButton.onclick = () => {
      linkInput.select()
      document.execCommand("copy")
      copyButton.textContent = "Copied!"
      setTimeout(() => {
        copyButton.textContent = "Copy"
      }, 2000)
    }

    const qrButton = document.createElement("button")
    qrButton.textContent = "QR Code"
    qrButton.onclick = () => {
      showQRCode(file.url, file.name)
    }

    shareLink.appendChild(linkInput)
    shareLink.appendChild(copyButton)
    shareLink.appendChild(qrButton)

    fileItem.appendChild(fileLink)
    fileItem.appendChild(shareLink)
    uploadedFiles.appendChild(fileItem)
  })

  // Save to history
  saveToHistory(files)
}

// Show QR code for a file
function showQRCode(url, fileName) {
  const modal = document.createElement("div")
  modal.className = "qr-modal"

  const modalContent = document.createElement("div")
  modalContent.className = "qr-modal-content"

  const closeButton = document.createElement("span")
  closeButton.className = "close-button"
  closeButton.textContent = "×"
  closeButton.onclick = () => {
    document.body.removeChild(modal)
  }

  const title = document.createElement("h3")
  title.textContent = `QR Code for ${fileName}`

  const qrImage = document.createElement("img")
  qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
  qrImage.alt = "QR Code"

  modalContent.appendChild(closeButton)
  modalContent.appendChild(title)
  modalContent.appendChild(qrImage)
  modal.appendChild(modalContent)

  document.body.appendChild(modal)

  // Close modal when clicking outside
  window.onclick = (event) => {
    if (event.target === modal) {
      document.body.removeChild(modal)
    }
  }
}

// Save uploaded files to history
function saveToHistory(files) {
  let history = JSON.parse(localStorage.getItem("fileHistory") || "[]")

  files.forEach((file) => {
    history.unshift({
      name: file.name,
      url: file.url,
      timestamp: new Date().toISOString(),
    })
  })

  // Keep only the last 20 items
  history = history.slice(0, 20)

  localStorage.setItem("fileHistory", JSON.stringify(history))
}

// Load file history
function loadFileHistory() {
  const history = JSON.parse(localStorage.getItem("fileHistory") || "[]")

  if (history.length > 0) {
    const historyContainer = document.getElementById("file-history")
    historyContainer.innerHTML = "<h3>Recent Files</h3>"

    history.forEach((item) => {
      const historyItem = document.createElement("div")
      historyItem.className = "history-item"

      const fileLink = document.createElement("a")
      fileLink.href = item.url
      fileLink.textContent = item.name
      fileLink.target = "_blank"

      const timestamp = document.createElement("span")
      timestamp.className = "timestamp"
      timestamp.textContent = new Date(item.timestamp).toLocaleString()

      historyItem.appendChild(fileLink)
      historyItem.appendChild(timestamp)
      historyContainer.appendChild(historyItem)
    })

    historyContainer.style.display = "block"
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", loadFileHistory)

