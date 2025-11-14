import React, { useState, useEffect, useRef } from 'react';
import amanImage from '../assets/images/aman.jpg';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const InteractiveBusinessCard = () => {
  const [formData, setFormData] = useState({
    name: 'Viponjit Singh AMAN',
    title: 'Digital Business Consultant',
    phone: '', // Made blank
    mapLink: 'https://maps.app.goo.gl/Cou17BteKzxrjEjH9',
    business: '', // Made blank
    photo: amanImage,
    socialMedia: {
      linkedin: '',
      twitter: '',
      instagram: '',
      facebook: '',
      youtube: '',
      whatsapp: ''
    }
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempFormData, setTempFormData] = useState({});
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const qrCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fallback image URL
  const fallbackImage = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80';

  // Debug: Log the imported image
  console.log('🖼️ Imported amanImage:', amanImage);
  console.log('🖼️ amanImage type:', typeof amanImage);
  console.log('🖼️ amanImage keys:', amanImage ? Object.keys(amanImage) : 'No keys');

  // Teal green color scheme
  const colors = {
    primary: '#0d9488',
    primaryLight: '#14b8a6',
    primaryDark: '#0f766e',
    background: '#ffffff',
    text: '#1e293b',
    textMuted: '#64748b',
    cardBackground: '#ffffff',
    border: '#e2e8f0',
    accent: '#f1f5f9'
  };

  // SVG Icons as components
  const PhoneIcon = ({ size = 20, color = "#ffffff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );

  const MapIcon = ({ size = 20, color = "#ffffff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );

  const BuildingIcon = ({ size = 20, color = "#ffffff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
      <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
      <path d="M12 3v6"/>
    </svg>
  );

  const ShareIcon = ({ size = 20, color = "#ffffff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  );

  const EditIcon = ({ size = 20, color = "#ffffff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );

  const SaveIcon = ({ size = 20, color = "#ffffff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  );

  // Improved image handler with debugging
  const getImageSource = (imageData) => {
    console.log('🔍 getImageSource called with:', imageData);
    console.log('🔍 imageData type:', typeof imageData);
    
    if (!imageData) {
      console.log('❌ No image data, using fallback');
      return fallbackImage;
    }
    
    // If it's a data URL or external URL
    if (typeof imageData === 'string') {
      console.log('📝 Image is string type');
      if (imageData.startsWith('data:')) {
        console.log('✅ Image is data URL');
        return imageData;
      } else if (imageData.startsWith('http')) {
        console.log('✅ Image is external URL');
        return imageData;
      } else {
        console.log('❓ Image string but not data/http:', imageData);
      }
    }
    
    // If it's an imported image module
    if (imageData && typeof imageData === 'object') {
      console.log('📦 Image is object type');
      console.log('📦 Image object keys:', Object.keys(imageData));
      
      if (imageData.default) {
        console.log('✅ Using image.default:', imageData.default);
        return imageData.default;
      }
    }
    
    console.log('⚠️ Using fallback image');
    return imageData || fallbackImage;
  };

  // Load data from Firebase on component mount
  useEffect(() => {
    console.log('🚀 Component mounted');
    const loadData = async () => {
      try {
        console.log('📡 Loading data from Firebase...');
        const docRef = doc(db, 'businessCards', 'viponjitSingh');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          console.log('✅ Firebase data found:', docSnap.data());
          const data = docSnap.data();
          // Ensure photo is properly handled when loading from Firebase
          const processedData = {
            ...data,
            photo: data.photo || amanImage
          };
          console.log('🖼️ Processed photo data:', processedData.photo);
          setFormData(processedData);
          showNotification('Data loaded successfully!', 'success');
        } else {
          console.log('📝 No Firebase data, saving initial data');
          // Save initial data if document doesn't exist
          await setDoc(docRef, {
            ...formData,
            photo: typeof amanImage === 'string' ? amanImage : 'amanImage'
          });
          showNotification('Initial data saved!', 'success');
        }
      } catch (error) {
        console.error('❌ Error loading data:', error);
        showNotification('Error loading data', 'error');
      }
    };

    loadData();
  }, []);

  // Debug formData changes
  useEffect(() => {
    console.log('🔄 formData updated:', formData);
    console.log('🖼️ Current formData.photo:', formData.photo);
    console.log('🖼️ formData.photo type:', typeof formData.photo);
  }, [formData]);

  const generateQRCode = () => {
    if (!qrCanvasRef.current || !window.QRious) return;
    
    try {
      const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${formData.name}
TITLE:${formData.title}
ORG:${formData.business}
TEL:${formData.phone}
END:VCARD`;

      new window.QRious({
        element: qrCanvasRef.current,
        value: vCardData,
        size: 200,
        background: 'white',
        foreground: colors.primary,
        level: 'M'
      });
    } catch (error) {
      console.error('QR Code generation error:', error);
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
    script.onload = () => generateQRCode();
    script.onerror = () => console.error('Failed to load QRious script');
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (window.QRious) {
      generateQRCode();
    }
  }, [formData]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openEditModal = () => {
    console.log('📝 Opening edit modal with tempFormData:', formData);
    setTempFormData({...formData});
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    console.log('❌ Closing edit modal');
    setIsEditModalOpen(false);
    setTempFormData({});
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      console.log('💾 Saving data to Firebase:', tempFormData);
      // Save to Firebase
      const docRef = doc(db, 'businessCards', 'viponjitSingh');
      await setDoc(docRef, tempFormData);
      
      setFormData(tempFormData);
      closeEditModal();
      showNotification('Profile updated and saved to cloud!', 'success');
    } catch (error) {
      console.error('❌ Error saving data:', error);
      showNotification('Error saving data to cloud', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`✏️ Field ${field} changed to:`, value);
    setTempFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    console.log('📸 Photo file selected:', file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('🖼️ FileReader loaded data URL');
        setTempFormData(prev => ({
          ...prev,
          photo: e.target.result
        }));
      };
      reader.onerror = (error) => {
        console.error('❌ FileReader error:', error);
      };
      reader.readAsDataURL(file);
    }
  };

  // Improved image error handler with detailed logging
  const handleImageError = (e, location = 'unknown') => {
    console.error(`❌ Image error in ${location}:`, e);
    console.error(`❌ Target src:`, e.target.src);
    console.error(`❌ Target naturalWidth:`, e.target.naturalWidth);
    console.error(`❌ Target naturalHeight:`, e.target.naturalHeight);
    
    e.target.src = fallbackImage;
    setImageError(true);
  };

  const createInteractiveCard = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      showNotification('Creating interactive business card...', 'success');

      let photoBase64;
      try {
        console.log('🎨 Processing photo for interactive card...');
        const currentPhoto = getImageSource(formData.photo);
        console.log('🖼️ Current photo for processing:', currentPhoto);
        
        if (typeof currentPhoto === 'string' && currentPhoto.startsWith('data:')) {
          console.log('✅ Using existing data URL');
          photoBase64 = currentPhoto;
        } else if (typeof currentPhoto === 'string' && currentPhoto.startsWith('http')) {
          console.log('🌐 Fetching external image...');
          const response = await fetch(currentPhoto);
          const blob = await response.blob();
          photoBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          console.log('✅ External image converted to data URL');
        } else {
          console.log('⚠️ Unknown image type, using fallback');
          photoBase64 = fallbackImage;
        }
      } catch (photoError) {
        console.error('❌ Photo processing error:', photoError);
        photoBase64 = fallbackImage;
      }

      console.log('📄 Final photoBase64 length:', photoBase64 ? photoBase64.length : 0);

      const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${formData.name}
TITLE:${formData.title}
ORG:${formData.business}
TEL:${formData.phone}
END:VCARD`;

      // ... rest of createInteractiveCard function remains the same
      const cardHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formData.name} - Business Card</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: linear-gradient(135deg, #000000 0%, #0f172a 50%, #000000 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .business-card {
      background: #0f172a;
      border: 3px solid #0d9488;
      border-radius: 20px;
      box-shadow: 0 0 40px rgba(13, 148, 136, 0.4), 0 0 80px rgba(13, 148, 136, 0.2);
      overflow: hidden;
      width: 100%;
      max-width: 400px;
      animation: glow 3s ease-in-out infinite alternate;
    }
    @keyframes glow {
      from { box-shadow: 0 0 20px rgba(13, 148, 136, 0.3), 0 0 40px rgba(13, 148, 136, 0.2); }
      to { box-shadow: 0 0 40px rgba(13, 148, 136, 0.5), 0 0 80px rgba(13, 148, 136, 0.3); }
    }
    .header {
      background: linear-gradient(135deg, #0d9488, #14b8a6);
      padding: 30px 20px;
      text-align: center;
    }
    .photo {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      margin: 0 auto 15px;
      border: 4px solid #ffffff;
      object-fit: cover;
      display: block;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    }
    .name {
      font-size: 24px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 5px;
    }
    .title {
      color: #ffffff;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 25px 20px;
      background: #0f172a;
    }
    .contact-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #1e293b;
      transition: all 0.3s ease;
    }
    .contact-item:last-child { border-bottom: none; }
    .contact-item:hover {
      background-color: #1e293b;
      padding-left: 12px;
      border-radius: 8px;
    }
    .icon {
      background: linear-gradient(135deg, #0d9488, #14b8a6);
      color: #ffffff;
      padding: 10px;
      border-radius: 10px;
      min-width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .contact-info {
      flex: 1;
    }
    .contact-label {
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .contact-value {
      color: #14b8a6;
      font-size: 15px;
      font-weight: 500;
      text-decoration: none;
    }
    .contact-value:hover { color: #2dd4bf; }
    .business-text {
      color: #ffffff;
      font-size: 14px;
      line-height: 1.5;
    }
    .business-item {
      margin-bottom: 4px;
      font-weight: 600;
    }
    .qr-section {
      background: linear-gradient(135deg, #1e293b, #334155);
      padding: 25px 20px;
      text-align: center;
      border-top: 2px solid #0d9488;
    }
    .qr-title {
      font-size: 16px;
      font-weight: bold;
      color: #14b8a6;
      margin-bottom: 20px;
    }
    .qr-container {
      background: white;
      padding: 20px;
      border-radius: 12px;
      display: inline-block;
      margin-bottom: 20px;
      width: 100%;
      max-width: 280px;
    }
    .action-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 20px;
    }
    .btn {
      background: linear-gradient(135deg, #0d9488, #14b8a6);
      color: #ffffff;
      border: none;
      padding: 12px 16px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(13, 148, 136, 0.4);
      background: linear-gradient(135deg, #14b8a6, #2dd4bf);
    }
    .footer {
      text-align: center;
      padding: 15px;
      font-size: 12px;
      color: #94a3b8;
      background: #0f172a;
    }
    @media (max-width: 480px) {
      .business-card { max-width: 350px; }
      .content { padding: 20px 15px; }
    }
  </style>
</head>
<body>
  <div class="business-card">
    <div class="header">
      ${photoBase64 ? `<img src="${photoBase64}" alt="${formData.name}" class="photo" onerror="console.error('Interactive card image failed to load')">` : ''}
      <div class="name">${formData.name}</div>
      ${formData.title ? `<div class="title">${formData.title}</div>` : ''}
    </div>
    
    <div class="content">
      ${formData.phone ? `
      <div class="contact-item">
        <div class="icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </div>
        <div class="contact-info">
          <div class="contact-label">Phone</div>
          <a href="tel:${formData.phone}" class="contact-value">${formData.phone}</a>
        </div>
      </div>
      ` : ''}
      
      <div class="contact-item">
        <div class="icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div class="contact-info">
          <div class="contact-label">Location</div>
          <a href="${formData.mapLink}" target="_blank" class="contact-value">View on Google Maps</a>
        </div>
      </div>
      
      ${formData.business ? `
      <div class="contact-item">
        <div class="icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
            <path d="M12 3v6"/>
          </svg>
        </div>
        <div class="contact-info">
          <div class="contact-label">Business</div>
          <div class="business-text">
            ${formData.business.split(',').map(business => `
              <div class="business-item">${business.trim()}</div>
            `).join('')}
          </div>
        </div>
      </div>
      ` : ''}
    </div>
    
    <div class="qr-section">
      <div class="qr-title">Scan to Save Contact</div>
      <div class="qr-container">
        <canvas id="qr-code" width="200" height="200" style="display: block; margin: 0 auto;"></canvas>
      </div>
      
      <div class="action-buttons">
        <button class="btn" onclick="saveContact()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Save Contact
        </button>
        ${formData.phone ? `
        <a href="tel:${formData.phone}" class="btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Call Now
        </a>
        ` : ''}
        <a href="${formData.mapLink}" target="_blank" class="btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          View Location
        </a>
      </div>
    </div>
    
    <div class="footer">
      GoodwillProperty
    </div>
  </div>

  <script>
    console.log('Interactive business card loaded');
    window.addEventListener('DOMContentLoaded', function() {
      console.log('DOM loaded, generating QR code...');
      if (window.QRious) {
        const vCardData = \`${vCardData}\`;
        new QRious({
          element: document.getElementById('qr-code'),
          value: vCardData,
          size: 200,
          background: 'white',
          foreground: '${colors.primary}',
          level: 'M'
        });
        console.log('QR code generated');
      } else {
        console.error('QRious not available');
      }
    });
    
    function saveContact() {
      console.log('Saving contact...');
      const vCardData = \`${vCardData}\`;
      const blob = new Blob([vCardData], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '${formData.name.replace(/\s+/g, '_')}_Contact.vcf';
      a.click();
      URL.revokeObjectURL(url);
      console.log('Contact saved');
    }
  </script>
</body>
</html>`;

      if (navigator.share) {
        try {
          const blob = new Blob([cardHTML], { type: 'text/html' });
          const file = new File([blob], `${formData.name.replace(/\s+/g, '-')}-card.html`, { type: 'text/html' });
          
          await navigator.share({
            title: `${formData.name} - Business Card`,
            files: [file]
          });
          showNotification('Business card shared successfully!', 'success');
          return;
        } catch (shareError) {
          console.log('Native share failed, opening card directly');
        }
      }

      const blob = new Blob([cardHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      showNotification('Interactive business card opened!', 'success');

    } catch (err) {
      console.error('Error creating business card:', err);
      showNotification('Error creating business card', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 transform translate-x-0 ${
          notification.type === 'success' ? 'bg-green-500' : 
          notification.type === 'error' ? 'bg-red-500' : 
          'bg-teal-500'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Photo Upload */}
              <div className="text-center">
                <div className="relative inline-block">
                  <img 
                    src={getImageSource(tempFormData.photo)} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full mx-auto border-4 border-teal-500 object-cover"
                    onError={(e) => handleImageError(e, 'edit-modal')}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-teal-500 text-white p-2 rounded-full shadow-lg hover:bg-teal-600 transition-colors"
                  >
                    <EditIcon size={16} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">Click camera icon to change photo</p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={tempFormData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={tempFormData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={tempFormData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Map Link</label>
                  <input
                    type="text"
                    value={tempFormData.mapLink || ''}
                    onChange={(e) => handleInputChange('mapLink', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business</label>
                  <textarea
                    value={tempFormData.business || ''}
                    onChange={(e) => handleInputChange('business', e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter businesses separated by commas"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <SaveIcon size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Card Container */}
      <div className="w-full max-w-sm sm:max-w-md mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-8 text-center">
            <div className="mb-6">
              <img 
                src={getImageSource(formData.photo)} 
                alt="Viponjit Singh AMAN" 
                className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
                onError={(e) => handleImageError(e, 'main-card')}
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {formData.name}
            </h1>
            {formData.title && (
              <p className="text-lg text-white opacity-95">
                {formData.title}
              </p>
            )}
          </div>

          {/* Contact Information Section */}
          <div className="px-6 py-6 bg-white">
            <div className="space-y-4">
              
              {/* Phone - Only show if phone exists */}
              {formData.phone && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200 transition-all duration-200 hover:shadow-md">
                  <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-3 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PhoneIcon size={20} color="#ffffff" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">
                      Phone
                    </div>
                    <a 
                      href={`tel:${formData.phone}`} 
                      className="text-lg text-teal-600 font-semibold no-underline hover:text-teal-500 transition-colors duration-200 block"
                    >
                      {formData.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Map Link */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200 transition-all duration-200 hover:shadow-md">
                <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-3 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapIcon size={20} color="#ffffff" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">
                    Location
                  </div>
                  <a 
                    href={formData.mapLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg text-teal-600 font-semibold no-underline hover:text-teal-500 transition-colors duration-200 block"
                  >
                    View on Map
                  </a>
                </div>
              </div>

              {/* Business - Only show if business exists */}
              {formData.business && (
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200 transition-all duration-200 hover:shadow-md">
                  <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-3 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <BuildingIcon size={20} color="#ffffff" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-2">
                      Business
                    </div>
                    <div className="space-y-2">
                      {formData.business.split(',').slice(0, 3).map((business, index) => (
                        <div 
                          key={index}
                          className="text-base font-semibold text-gray-800 leading-tight"
                        >
                          {business.trim()}
                        </div>
                      ))}
                      {formData.business.split(',').length > 3 && (
                        <div className="text-sm text-teal-600 font-semibold">
                          +{formData.business.split(',').length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* QR Code Section */}
          <div className="bg-gray-50 px-6 py-8 text-center border-t border-gray-200">
            <h3 className="text-xl font-bold text-teal-600 mb-6">
              Scan to Save Contact
            </h3>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 inline-block mb-6 w-full max-w-[240px]">
              <canvas 
                ref={qrCanvasRef}
                className="w-48 h-48 mx-auto block"
                style={{ display: 'block' }}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={openEditModal}
                className="bg-gray-600 text-white border-none px-4 py-3 rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-md hover:bg-gray-700"
              >
                <EditIcon size={18} color="#ffffff" />
                Edit
              </button>
              <button 
                onClick={createInteractiveCard}
                disabled={loading}
                className={`
                  bg-gradient-to-r from-teal-600 to-teal-500 text-white border-none px-4 py-3 
                  rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 
                  flex items-center justify-center gap-2 hover:shadow-md transform hover:-translate-y-0.5
                  disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
                `}
              >
                <ShareIcon size={18} color="#ffffff" />
                {loading ? 'Creating...' : 'Share'}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-teal-600 px-6 py-4 text-center">
            <div className="text-white font-semibold text-lg">
              GoodwillProperty
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveBusinessCard;