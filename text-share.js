import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm'
import { supabaseConfig } from "./config.js"
const supabase = createClient(
  'SUPABASE_URL', // Replace with your Supabase URL
  'SUPABASE_ANON_KEY' // Replace with your Supabase anon key
);
// DOM elements
const textArea = document.getElementById("text-content")
const shareButton = document.getElementById("share-button")
const shareLink = document.getElementById("share-link")
const shareLinkInput = document.getElementById("share-link-input")
const copyButton = document.getElementById("copy-button")
const qrButton = document.getElementById("qr-button")
const textHistory = document.getElementById("text-history")

// Cloudinary configuration
const CLOUD_NAME = 'YOUR-CLOUD-NAME'
const UPLOAD_PRESET = 'YOUD-CLOUD-PRESET'

// Event listeners
shareButton.addEventListener("click", shareText)
copyButton.addEventListener("click", copyOTP)
qrButton.addEventListener("click", showQRCode)

async function shareText() {
  const text = textArea.value.trim()

  if (!text) {
    alert("Please enter some text to share.")
    return
  }

  try {
    shareButton.disabled = true
    shareButton.textContent = "Sharing..."

    // Upload text to Cloudinary
    const url = await uploadTextToCloudinary(text)
    
    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    
    // Store in Supabase
    const { error } = await supabase
      .from('files')
      .insert([{ otp, url }])

    if (error) throw error

    // Display OTP
    shareLinkInput.value = otp
    shareLink.style.display = "flex"

    // Save to history
    saveToHistory(text, otp)

  } catch (error) {
    console.error("Error sharing text:", error)
    alert(`Failed to share text: ${error.message}`)
  } finally {
    shareButton.disabled = false
    shareButton.textContent = "Share Text"
  }
}

function uploadTextToCloudinary(text) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([text], { type: "text/plain" })
    const file = new File([blob], `text-${Date.now()}.txt`, { 
      type: "text/plain",
      lastModified: Date.now()
    })

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", UPLOAD_PRESET)
    formData.append("cloud_name", CLOUD_NAME)

    const xhr = new XMLHttpRequest()
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`)

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          resolve(response.secure_url)
        } catch (e) {
          reject(new Error("Failed to parse Cloudinary response"))
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`))
      }
    }

    xhr.onerror = () => reject(new Error("Network error"))
    xhr.ontimeout = () => reject(new Error("Request timed out"))
    xhr.send(formData)
  })
}

function copyOTP() {
  shareLinkInput.select()
  document.execCommand("copy")
  copyButton.textContent = "Copied!"
  setTimeout(() => {
    copyButton.textContent = "Copy"
  }, 2000)
}

function showQRCode() {
  const otp = shareLinkInput.value
  if (!otp) return

  const modal = document.createElement("div")
  modal.className = "qr-modal"
  modal.innerHTML = `
    <div class="qr-modal-content">
      <span class="close-button">×</span>
      <h3>QR Code for OTP: ${otp}</h3>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${otp}" alt="QR Code">
    </div>
  `

  modal.querySelector(".close-button").onclick = () => modal.remove()
  document.body.appendChild(modal)
}



document.addEventListener("DOMContentLoaded", loadTextHistory)