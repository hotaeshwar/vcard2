import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const InteractiveBusinessCard = () => {
  // Public folder image path
  const publicImagePath = '/images/aman.jpg';

  const [formData, setFormData] = useState({
    name: 'Viponjit Singh AMAN',
    title: 'Digital Business Consultant',
    phone: '',
    mapLink: 'https://maps.app.goo.gl/Cou17BteKzxrjEjH9',
    photo: publicImagePath,
    facebook: '',
    instagram: '',
    whatsapp: '',
    gmbProfile: '',
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

  const FacebookIcon = ({ size = 20, color = "#ffffff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );

  const InstagramIcon = ({ size = 20, color = "#ffffff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );

  const WhatsAppIcon = ({ size = 20, color = "#ffffff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  );

  const BusinessIcon = ({ size = 20, color = "#ffffff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
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

  // Simplified image handler for public folder
  const getImageSource = (imageData) => {
    console.log('🔍 getImageSource called with:', imageData);
    
    if (!imageData) {
      console.log('📁 Using default public folder image');
      return publicImagePath;
    }
    
    // If it's a data URL or external URL, use it directly
    if (typeof imageData === 'string') {
      if (imageData.startsWith('data:') || imageData.startsWith('http')) {
        console.log('✅ Using data URL or external URL');
        return imageData;
      }
      
      // If it's the public folder path or any other path, use public folder image
      console.log('📁 Using public folder image');
      return publicImagePath;
    }
    
    // For any other case, use public folder image
    console.log('📁 Using default public folder image');
    return publicImagePath;
  };

  // Phone number sanitization function
  const sanitizePhone = (phone) => {
    if (!phone) return '';
    
    // Replace fancy Unicode digits with regular ASCII digits
    const unicodeMap = {
      '𝟬': '0', '𝟭': '1', '𝟮': '2', '𝟯': '3', '𝟰': '4',
      '𝟱': '5', '𝟲': '6', '𝟳': '7', '𝟴': '8', '𝟵': '9',
      '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
      '５': '5', '６': '6', '７': '7', '８': '8', '９': '9'
    };
    
    let cleaned = phone;
    Object.keys(unicodeMap).forEach(fancy => {
      cleaned = cleaned.split(fancy).join(unicodeMap[fancy]);
    });
    
    // Remove all non-digit characters except + and -
    cleaned = cleaned.replace(/[^\d+\-]/g, '');
    
    return cleaned;
  };

  // Generate vCard data for QR code
  const generateVCardData = () => {
    const cleanPhone = sanitizePhone(formData.phone);
    const cleanWhatsApp = sanitizePhone(formData.whatsapp);
    const cleanName = formData.name ? formData.name.trim() : '';
    const nameParts = cleanName.split(' ');
    const lastName = nameParts[nameParts.length - 1] || '';
    const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0] || '';
    
    // Build vCard with proper formatting
    const vCardData = 
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      `FN:${cleanName}\n` +
      `N:${lastName};${firstName};;;\n` +
      (formData.title ? `TITLE:${formData.title}\n` : '') +
      (cleanPhone ? `TEL;TYPE=CELL:${cleanPhone}\n` : '') +
      (formData.mapLink ? `URL:${formData.mapLink}\n` : '') +
      (formData.facebook ? `URL;TYPE=Facebook:${formData.facebook}\n` : '') +
      (formData.instagram ? `URL;TYPE=Instagram:${formData.instagram}\n` : '') +
      (cleanWhatsApp ? `TEL;TYPE=WhatsApp:${cleanWhatsApp}\n` : '') +
      (formData.gmbProfile ? `URL;TYPE=GoogleBusiness:${formData.gmbProfile}\n` : '') +
      'END:VCARD';

    console.log('📇 Generated vCard data:', vCardData);
    return vCardData;
  };

  // Generate QR code for main card
  const generateQRCode = () => {
    if (!qrCanvasRef.current || !window.QRious) return;
    
    try {
      const vCardData = generateVCardData();
      
      new window.QRious({
        element: qrCanvasRef.current,
        value: vCardData,
        size: 300,
        background: 'white',
        foreground: colors.primary,
        level: 'M'
      });
    } catch (error) {
      console.error('QR Code generation error:', error);
    }
  };

  // Load QRious script and generate QR code
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

  // Regenerate QR code when formData changes
  useEffect(() => {
    if (window.QRious) {
      generateQRCode();
    }
  }, [formData, colors.primary]);

  // Load data from Firebase on component mount
  useEffect(() => {
    console.log('🚀 Component mounted, loading Firebase data...');
    const loadData = async () => {
      try {
        const docRef = doc(db, 'businessCards', 'viponjitSingh');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          console.log('✅ Firebase data found:', docSnap.data());
          const data = docSnap.data();
          
          // Fix the photo data from Firebase - use public folder path
          const processedData = {
            ...data,
            photo: publicImagePath
          };
          
          console.log('🖼️ Processed data with public image:', processedData);
          setFormData(processedData);
          showNotification('Data loaded successfully!', 'success');
        } else {
          console.log('📝 No Firebase data, saving initial data');
          // Save initial data if document doesn't exist
          await setDoc(docRef, {
            ...formData,
            photo: 'default'
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

  const showNotification = (message, type = 'info') => {
    console.log(`📢 Notification: ${message} (${type})`);
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openEditModal = () => {
    console.log('📝 Opening edit modal with data:', formData);
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
      
      // Prepare data for Firebase - don't save the actual image data
      const dataToSave = {
        ...tempFormData,
        // Don't save image data to Firebase, just a marker
        photo: 'user-uploaded'
      };
      
      // Save to Firebase
      const docRef = doc(db, 'businessCards', 'viponjitSingh');
      await setDoc(docRef, dataToSave);
      
      // Update local state
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

  // Improved image error handler
  const handleImageError = (e) => {
    console.error('❌ Image error:', e);
    e.target.src = fallbackImage;
    setImageError(true);
  };

  // Function to convert image to base64 for the interactive card
  const getImageBase64 = async (imageSource) => {
    try {
      console.log('🎨 Processing image for base64 conversion:', imageSource);
      
      // If it's already a data URL, return it directly
      if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
        console.log('✅ Already a data URL, using directly');
        return imageSource;
      }
      
      // If it's the public folder path, construct full URL
      if (typeof imageSource === 'string' && imageSource.startsWith('/')) {
        const fullUrl = window.location.origin + imageSource;
        console.log('🔗 Fetching public folder image from:', fullUrl);
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error('Failed to fetch image');
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            console.log('✅ Public image converted to base64');
            resolve(reader.result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
      
      // If it's an external URL, fetch and convert
      if (typeof imageSource === 'string' && imageSource.startsWith('http')) {
        console.log('🌐 Fetching external image for conversion...');
        const response = await fetch(imageSource);
        if (!response.ok) throw new Error('Failed to fetch image');
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            console.log('✅ External image converted to base64');
            resolve(reader.result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
      
      // For all other cases, use fallback
      console.log('📦 Using fallback image');
      return fallbackImage;
      
    } catch (error) {
      console.error('❌ Error converting image to base64:', error);
      return fallbackImage;
    }
  };

  const createInteractiveCard = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      console.log('🚀 Starting interactive card creation...');
      showNotification('Creating interactive business card...', 'success');

      // Get the current photo source
      const currentPhoto = getImageSource(formData.photo);
      console.log('🖼️ Current photo source:', currentPhoto);
      
      // Convert image to base64
      console.log('🔄 Converting image to base64...');
      const photoBase64 = await getImageBase64(currentPhoto);
      console.log('✅ Photo converted to base64, length:', photoBase64.length);
      console.log('📸 Base64 preview:', photoBase64.substring(0, 100) + '...');

      // Generate vCard data for the interactive card
      console.log('📇 Generating vCard data...');
      const vCardData = generateVCardData();
      console.log('✅ vCard data generated');

      console.log('🛠️ Building HTML content...');
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
      <img src="${photoBase64}" alt="${formData.name}" class="photo" onerror="this.src='${fallbackImage}'">
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
      
      ${formData.facebook ? `
      <div class="contact-item">
        <div class="icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
        </div>
        <div class="contact-info">
          <div class="contact-label">Facebook</div>
          <a href="${formData.facebook}" target="_blank" class="contact-value">Visit Facebook</a>
        </div>
      </div>
      ` : ''}
      
      ${formData.instagram ? `
      <div class="contact-item">
        <div class="icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
        </div>
        <div class="contact-info">
          <div class="contact-label">Instagram</div>
          <a href="${formData.instagram}" target="_blank" class="contact-value">Visit Instagram</a>
        </div>
      </div>
      ` : ''}
      
      ${formData.whatsapp ? `
      <div class="contact-item">
        <div class="icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </div>
        <div class="contact-info">
          <div class="contact-label">WhatsApp</div>
          <a href="https://wa.me/${formData.whatsapp}" target="_blank" class="contact-value">Chat on WhatsApp</a>
        </div>
      </div>
      ` : ''}
      
      ${formData.gmbProfile ? `
      <div class="contact-item">
        <div class="icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div class="contact-info">
          <div class="contact-label">Google Business</div>
          <a href="${formData.gmbProfile}" target="_blank" class="contact-value">View Profile</a>
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
    console.log('📱 Interactive card loaded successfully');
    
    window.addEventListener('DOMContentLoaded', function() {
      console.log('🎯 DOM fully loaded, initializing QR code...');
      if (window.QRious) {
        const vCardData = \`${vCardData}\`;
        console.log('🔗 QRious available, generating QR code...');
        new QRious({
          element: document.getElementById('qr-code'),
          value: vCardData,
          size: 200,
          background: 'white',
          foreground: '${colors.primary}',
          level: 'M'
        });
        console.log('✅ QR code generated successfully');
      } else {
        console.error('❌ QRious not available');
      }
    });
    
    function saveContact() {
      console.log('💾 Save contact function called');
      const vCardData = \`${vCardData}\`;
      console.log('📄 vCard data length:', vCardData.length);
      const blob = new Blob([vCardData], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '${formData.name.replace(/\s+/g, '_')}_Contact.vcf';
      console.log('📥 Downloading contact:', a.download);
      a.click();
      URL.revokeObjectURL(url);
      console.log('✅ Contact download initiated');
    }
  </script>
</body>
</html>`;

    console.log('✅ HTML content built, length:', cardHTML.length);
    console.log('📱 Checking for Web Share API support...');
    console.log('navigator.share available:', !!navigator.share);
    console.log('navigator.canShare available:', !!navigator.canShare);
    console.log('🌐 Browser info:', {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor
    });

    if (navigator.share) {
      try {
        console.log('🔄 Web Share API available, creating shareable file...');
        const blob = new Blob([cardHTML], { type: 'text/html' });
        console.log('📄 Blob created, size:', blob.size);
        
        const fileName = `${formData.name.replace(/\s+/g, '-')}-card.html`;
        console.log('📁 File name:', fileName);
        
        const file = new File([blob], fileName, { type: 'text/html' });
        console.log('📋 File object created');

        // Check if file can be shared
        if (navigator.canShare) {
          const canShareFile = navigator.canShare({ files: [file] });
          console.log('📤 File can be shared via Web Share API:', canShareFile);
          
          if (!canShareFile) {
            console.log('❌ File cannot be shared, checking text-only sharing...');
            const canShareText = navigator.canShare({
              title: `${formData.name} - Business Card`,
              text: `Check out ${formData.name}'s digital business card`
            });
            console.log('📝 Text-only sharing available:', canShareText);
          }
        } else {
          console.log('ℹ️ navigator.canShare not available, attempting share anyway...');
        }

        console.log('🔄 Attempting to share via Web Share API...');
        const shareData = {
          title: `${formData.name} - Business Card`,
          text: `Check out ${formData.name}'s digital business card`,
          files: [file]
        };
        console.log('📤 Share data:', shareData);
        
        await navigator.share(shareData);
        
        console.log('✅ Web Share API successful!');
        showNotification('Business card shared successfully!', 'success');
        return;
      } catch (shareError) {
        console.error('❌ Web Share API failed:', shareError);
        console.log('🔍 Share error details:', {
          name: shareError.name,
          message: shareError.message,
          code: shareError.code
        });
        
        // Check if it's an AbortError (user cancelled)
        if (shareError.name === 'AbortError') {
          console.log('👤 User cancelled the share');
          showNotification('Share cancelled', 'info');
        } else {
          console.log('🔄 Falling back to direct download due to share error...');
        }
      }
    } else {
      console.log('❌ Web Share API not supported in this browser');
      console.log('💡 Consider using direct WhatsApp sharing as fallback');
    }

    console.log('🔄 Opening card in new window as fallback...');
    const blob = new Blob([cardHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    console.log('🔗 Object URL created:', url);
    
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      console.log('✅ Interactive business card opened in new window');
      showNotification('Interactive business card opened!', 'success');
    } else {
      console.error('❌ Failed to open new window - might be blocked by popup blocker');
      showNotification('Please allow popups to view the business card', 'error');
    }

  } catch (err) {
    console.error('💥 Error creating business card:', err);
    console.error('🔍 Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    showNotification('Error creating business card: ' + err.message, 'error');
  } finally {
    setLoading(false);
    console.log('🏁 Interactive card creation process completed');
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 sm:px-6 sm:py-3 rounded-lg text-white font-medium transition-all duration-300 transform translate-x-0 text-sm sm:text-base ${
          notification.type === 'success' ? 'bg-green-500' : 
          notification.type === 'error' ? 'bg-red-500' : 
          'bg-teal-500'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 md:p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-4 sm:px-6 py-4 rounded-t-2xl">
              <h2 className="text-lg sm:text-xl font-bold text-white">Edit Profile</h2>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
              {/* Photo Upload */}
              <div className="text-center">
                <div className="relative inline-block">
                  <img 
                    src={getImageSource(tempFormData.photo)} 
                    alt="Profile" 
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto border-4 border-teal-500 object-cover"
                    onError={handleImageError}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-teal-500 text-white p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-teal-600 transition-colors"
                  >
                    <EditIcon size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">Click camera icon to change photo</p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={tempFormData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={tempFormData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={tempFormData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Map Link</label>
                  <input
                    type="text"
                    value={tempFormData.mapLink || ''}
                    onChange={(e) => handleInputChange('mapLink', e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* New Social Media Fields */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                  <input
                    type="text"
                    value={tempFormData.facebook || ''}
                    onChange={(e) => handleInputChange('facebook', e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="https://facebook.com/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                  <input
                    type="text"
                    value={tempFormData.instagram || ''}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={tempFormData.whatsapp || ''}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter WhatsApp number"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Google Business Profile</label>
                  <input
                    type="text"
                    value={tempFormData.gmbProfile || ''}
                    onChange={(e) => handleInputChange('gmbProfile', e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="https://g.page/yourbusiness"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-4">
                <button
                  onClick={closeEditModal}
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <SaveIcon size={14} className="sm:w-4 sm:h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Card Container */}
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-4 sm:px-6 py-6 sm:py-8 text-center">
            <div className="mb-4 sm:mb-6">
              <img 
                src={getImageSource(formData.photo)} 
                alt="Viponjit Singh AMAN" 
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
                onError={handleImageError}
              />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
              {formData.name}
            </h1>
            {formData.title && (
              <p className="text-base sm:text-lg md:text-xl text-white opacity-95">
                {formData.title}
              </p>
            )}
          </div>

          {/* Contact Information Section */}
          <div className="px-4 sm:px-6 py-4 sm:py-6 bg-white">
            <div className="space-y-3 sm:space-y-4">
              
              {/* Phone - Only show if phone exists */}
              {formData.phone && (
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-200 transition-all duration-200 hover:shadow-md">
                  <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-2 sm:p-3 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PhoneIcon size={16} className="sm:w-5 sm:h-5" color="#ffffff" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">
                      Phone
                    </div>
                    <a 
                      href={`tel:${formData.phone}`} 
                      className="text-sm sm:text-lg md:text-base text-teal-600 font-semibold no-underline hover:text-teal-500 transition-colors duration-200 block truncate"
                    >
                      {formData.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Map Link */}
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-200 transition-all duration-200 hover:shadow-md">
                <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-2 sm:p-3 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapIcon size={16} className="sm:w-5 sm:h-5" color="#ffffff" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">
                    Location
                  </div>
                  <a 
                    href={formData.mapLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm sm:text-lg md:text-base text-teal-600 font-semibold no-underline hover:text-teal-500 transition-colors duration-200 block truncate"
                  >
                    View on Map
                  </a>
                </div>
              </div>

              {/* Facebook - Only show if exists */}
              {formData.facebook && (
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-200 transition-all duration-200 hover:shadow-md">
                  <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-2 sm:p-3 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FacebookIcon size={16} className="sm:w-5 sm:h-5" color="#ffffff" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">
                      Facebook
                    </div>
                    <a 
                      href={formData.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm sm:text-lg md:text-base text-teal-600 font-semibold no-underline hover:text-teal-500 transition-colors duration-200 block truncate"
                    >
                      Visit Profile
                    </a>
                  </div>
                </div>
              )}

              {/* Instagram - Only show if exists */}
              {formData.instagram && (
                <div className="flex items-center gap=3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-200 transition-all duration-200 hover:shadow-md">
                  <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-2 sm:p-3 rounded-xl flex items-center justify-center flex-shrink-0">
                    <InstagramIcon size={16} className="sm:w-5 sm:h-5" color="#ffffff" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">
                      Instagram
                    </div>
                    <a 
                      href={formData.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm sm:text-lg md:text-base text-teal-600 font-semibold no-underline hover:text-teal-500 transition-colors duration-200 block truncate"
                    >
                      Visit Profile
                    </a>
                  </div>
                </div>
              )}

              {/* WhatsApp - Only show if exists */}
              {formData.whatsapp && (
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-200 transition-all duration-200 hover:shadow-md">
                  <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-2 sm:p-3 rounded-xl flex items-center justify-center flex-shrink-0">
                    <WhatsAppIcon size={16} className="sm:w-5 sm:h-5" color="#ffffff" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">
                      WhatsApp
                    </div>
                    <a 
                      href={`https://wa.me/${formData.whatsapp}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm sm:text-lg md:text-base text-teal-600 font-semibold no-underline hover:text-teal-500 transition-colors duration-200 block truncate"
                    >
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>
              )}

              {/* Google Business Profile - Only show if exists */}
              {formData.gmbProfile && (
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-200 transition-all duration-200 hover:shadow-md">
                  <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-2 sm:p-3 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BusinessIcon size={16} className="sm:w-5 sm:h-5" color="#ffffff" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">
                      Google Business
                    </div>
                    <a 
                      href={formData.gmbProfile} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm sm:text-lg md:text-base text-teal-600 font-semibold no-underline hover:text-teal-500 transition-colors duration-200 block truncate"
                    >
                      View Profile
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* QR Code Section */}
          <div className="bg-gray-50 px-4 sm:px-6 py-6 sm:py-8 text-center border-t border-gray-200">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-teal-600 mb-4 sm:mb-6">
              Scan to Save Contact
            </h3>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 inline-block mb-4 sm:mb-6 w-full max-w-[200px] sm:max-w-[240px]">
              <canvas 
                ref={qrCanvasRef}
                className="w-32 h-32 sm:w-48 sm:h-48 mx-auto block"
                style={{ display: 'block' }}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button 
                onClick={openEditModal}
                className="bg-gray-600 text-white border-none px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-md hover:bg-gray-700"
              >
                <EditIcon size={14} className="sm:w-4 sm:h-4" color="#ffffff" />
                Edit
              </button>
              <button 
                onClick={createInteractiveCard}
                disabled={loading}
                className={`
                  bg-gradient-to-r from-teal-600 to-teal-500 text-white border-none px-3 sm:px-4 py-2 sm:py-3 
                  rounded-lg text-sm sm:text-base font-semibold cursor-pointer transition-all duration-300 
                  flex items-center justify-center gap-2 hover:shadow-md transform hover:-translate-y-0.5
                  disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
                `}
              >
                <ShareIcon size={14} className="sm:w-4 sm:h-4" color="#ffffff" />
                {loading ? 'Creating...' : 'Share'}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-teal-600 px-4 sm:px-6 py-3 sm:py-4 text-center">
            <div className="text-white font-semibold text-base sm:text-lg md:text-xl">
              GoodwillProperty
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveBusinessCard;
