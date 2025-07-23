const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createSampleTasks() {
  try {
    console.log('Creating sample tasks...');

    const sampleTasks = [
      {
        title: 'Shooting de boda - María y Juan',
        projectId: 'sample-project-1',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        priority: 'high',
        assignee: 'admin',
        completed: false,
        notes: 'Shooting principal de la boda en la iglesia',
        taskType: 'action',
      },
      {
        title: 'Reunión con cliente - Empresa ABC',
        projectId: 'sample-project-2',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        priority: 'medium',
        assignee: 'admin',
        completed: false,
        notes: 'Reunión para discutir proyecto corporativo',
        taskType: 'action',
      },
      {
        title: 'Edición de fotos - Quinceañera',
        projectId: 'sample-project-3',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        priority: 'medium',
        assignee: 'admin',
        completed: false,
        notes: 'Edición de fotos del evento de quinceañera',
        taskType: 'action',
      },
      {
        title: 'Entrega final - Boda de Ana',
        projectId: 'sample-project-4',
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday (overdue)
        priority: 'high',
        assignee: 'admin',
        completed: false,
        notes: 'Entrega final de fotos y video',
        taskType: 'action',
      },
      {
        title: 'Zoom call - Cliente nuevo',
        projectId: 'sample-project-5',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
        priority: 'low',
        assignee: 'admin',
        completed: false,
        notes: 'Llamada de Zoom para discutir nuevo proyecto',
        taskType: 'action',
      },
    ];

    for (const task of sampleTasks) {
      const docRef = await addDoc(collection(db, 'projectTasks'), {
        ...task,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`Created task: ${task.title} with ID: ${docRef.id}`);
    }

    console.log('Sample tasks created successfully!');
  } catch (error) {
    console.error('Error creating sample tasks:', error);
  }
}

// Run the script
createSampleTasks(); 