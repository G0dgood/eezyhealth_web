# Firebase Integration

This project uses Firebase for both authentication and data storage. We've implemented two approaches:

## Option 1: Cloud Functions (Previous Implementation)
- Uses RTK Query to call Firebase Cloud Functions
- Requires CORS configuration on the backend
- More complex setup but provides centralized API management

## Option 2: Direct Firebase SDK (Current Implementation)
- Uses Firebase SDK directly from the frontend
- No CORS issues
- Simpler setup and faster development

## Current Setup

### Firebase Configuration
- **Authentication**: Google Sign-in and Email/Password
- **Firestore**: Document database for user profiles
- **Realtime Database**: Real-time data for users and other entities

### Key Functions

#### `fetchAllUsers()`
Fetches all users from the Realtime Database:
```typescript
import { fetchAllUsers } from '@/lib/firebase';

const users = await fetchAllUsers();
```

#### `fetchUserData(uid)`
Fetches a specific user from Firestore:
```typescript
import { fetchUserData } from '@/lib/firebase';

const user = await fetchUserData('user123');
```

## Environment Variables

Make sure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Database Structure

### Realtime Database
```
/users
  /{uid}
    email: string
    display_name: string
    role: "ADMIN" | "DOCTOR" | "NURSE"
    phone_number: string
    address: string
    location: string
    date_of_birth: string
    isActive: boolean
    createdTime: string
    first_name: string
    last_name: string
```

### Firestore
```
/users (collection)
  /{uid} (document)
    uid: string
    email: string
    display_name: string
    role: string
    // ... other user fields
```

## Usage Examples

### Admin Users Page
The admin users page now fetches data directly from Firebase:

```typescript
import { fetchAllUsers } from '@/lib/firebase';

const [users, setUsers] = useState([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const loadUsers = async () => {
    try {
      const usersData = await fetchAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  loadUsers();
}, []);
```

## Benefits of Direct Firebase Integration

1. **No CORS Issues**: Firebase SDK handles cross-origin requests automatically
2. **Real-time Updates**: Can easily implement real-time listeners
3. **Simpler Setup**: No need for Cloud Functions or backend API
4. **Better Performance**: Direct database access without API layer
5. **Offline Support**: Firebase provides offline capabilities out of the box

## Security Considerations

- Firebase Security Rules should be properly configured
- User authentication is required for sensitive operations
- Consider implementing role-based access control in security rules
