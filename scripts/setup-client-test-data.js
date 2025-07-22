const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');

// Firebase config (replace with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupClientTestData() {
  try {
    console.log('Setting up test client data...');

    // Create test client
    const clientData = {
      name: 'Test Client',
      email: 'test@client.com',
      password: 'test123', // In production, use proper auth
      company: 'Test Company',
      phone: '+1234567890',
      projects: ['project1', 'project2'],
      lastLogin: new Date(),
      createdAt: new Date()
    };

    const clientRef = await addDoc(collection(db, 'clients'), clientData);
    console.log('✅ Created test client with ID:', clientRef.id);

    // Create test projects
    const projects = [
      {
        title: { en: 'Wedding Photography', es: 'Fotografía de Boda', pt: 'Fotografia de Casamento' },
        status: 'in-progress',
        eventType: 'Wedding',
        eventDate: '2025-06-15',
        location: 'Barcelona, Spain',
        clientId: clientRef.id,
        mediaCount: { photos: 150, videos: 3 },
        milestones: [
          { id: 'm1', title: 'Initial Consultation', date: '2025-01-15', status: 'completed' },
          { id: 'm2', title: 'Photo Session', date: '2025-06-15', status: 'pending' },
          { id: 'm3', title: 'Photo Selection', date: '2025-06-20', status: 'pending' },
          { id: 'm4', title: 'Final Delivery', date: '2025-07-01', status: 'pending' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: { en: 'Corporate Event', es: 'Evento Corporativo', pt: 'Evento Corporativo' },
        status: 'completed',
        eventType: 'Corporate',
        eventDate: '2024-12-10',
        location: 'Madrid, Spain',
        clientId: clientRef.id,
        mediaCount: { photos: 200, videos: 5 },
        milestones: [
          { id: 'm1', title: 'Planning Meeting', date: '2024-11-01', status: 'completed' },
          { id: 'm2', title: 'Event Coverage', date: '2024-12-10', status: 'completed' },
          { id: 'm3', title: 'Photo Editing', date: '2024-12-15', status: 'completed' },
          { id: 'm4', title: 'Final Delivery', date: '2024-12-20', status: 'completed' }
        ],
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-12-20')
      }
    ];

    for (const project of projects) {
      const projectRef = await addDoc(collection(db, 'projects'), project);
      console.log('✅ Created project:', project.title.en, 'with ID:', projectRef.id);
    }

    // Create test files
    const files = [
      {
        projectId: 'project1', // Will be replaced with actual project ID
        name: 'wedding_photos.zip',
        type: 'image',
        size: 250 * 1024 * 1024, // 250MB
        url: 'https://example.com/files/wedding_photos.zip',
        uploadedBy: 'Veloz Team',
        uploadedAt: new Date(),
        description: 'Wedding photo collection'
      },
      {
        projectId: 'project1',
        name: 'wedding_video.mp4',
        type: 'video',
        size: 500 * 1024 * 1024, // 500MB
        url: 'https://example.com/files/wedding_video.mp4',
        uploadedBy: 'Veloz Team',
        uploadedAt: new Date(),
        description: 'Wedding highlight video'
      }
    ];

    for (const file of files) {
      await addDoc(collection(db, 'project_files'), file);
      console.log('✅ Created file:', file.name);
    }

    // Create test messages
    const messages = [
      {
        projectId: 'project1',
        from: 'Veloz Team',
        to: 'Client',
        subject: 'Wedding Photos Ready',
        content: 'Your wedding photos are ready for review. Please check the files section.',
        type: 'update',
        date: new Date(),
        read: false
      },
      {
        projectId: 'project1',
        from: 'Client',
        to: 'Veloz Team',
        subject: 'Photo Selection Questions',
        content: 'I have some questions about the photo selection process. Can we schedule a call?',
        type: 'note',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true
      }
    ];

    for (const message of messages) {
      await addDoc(collection(db, 'project_messages'), message);
      console.log('✅ Created message:', message.subject);
    }

    console.log('\n🎉 Test data setup complete!');
    console.log('\n📋 Test Credentials:');
    console.log('Email: test@client.com');
    console.log('Password: test123');
    console.log('Client ID:', clientRef.id);

  } catch (error) {
    console.error('❌ Error setting up test data:', error);
  }
}

setupClientTestData(); 