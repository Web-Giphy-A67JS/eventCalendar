# Event Calendar

Hosted on Firebase Hosting at: 
  - https://eventcalendar-a67.web.app/

## Setup

- Clonign repository and then running npm install
- Once everything is installed - npm run dev

## User Authentication & Management

### Registration
- Firebase Auth creates user with email/password
- User gets unique Firebase UID
- Additional user data (handle, name, etc.) stored in Realtime DB: `users/{handle}`
- Structure includes: handle, uid, email, first name, last name, phone, role, createdOn

### Login
- Firebase Auth handles email/password verification
- Returns user object with UID
- App fetches additional user data from `users/{handle}`

## User Management
- ADmins can search for users by handle, first and last name, email
- Roles can be updated: `users/{handle}/role`
- User data stored by handle for easy lookup

## Events Operations

### Creating Events
- Stored in `events/{eventId}`
- Structure includes:
    - title
    - startDate
    - endDate
    - private(true or false)
    - description
    - owner
    - recurrance (if we decide to create a recurring event)

### Deleting Events
- Removes entire event node: `events/{eventId}`

# Firebase Realtime Database Structure

This project uses Firebase Realtime Database to store and retrieve data for the application. The database is organized into three main entities: `events`, `contactLists` and `users`.

## Database Schema

### `contactLists` Collection
Each contact list contains the following attributes:

- `uid`: (string) unique identifier for the contact list.
- `name`: (string) name of the list (Work, Friends, etc.).
- `Id`: (string) the uid of the list is kept inside as well.
- `contacts`: (array) an array of objects where each object has an index and inside that index we have the first and last names of the user who is part of this list and their email.
- `owner`: (string) uid of the creator of the contact list.

**Example structure:**
```json
{
  "contactLists": {
    "-OLrxG1wepREiM6Zylvm": {
      "contacts": {
        "0": {
          "email": "nrichard56@test.com",
          "name": "Noah Richardson"
        },
        "1": {
          "email": "ecarter92@test.com",
          "name": "Emma Carter"
        }
      },
      "id": "-OLrxG1wepREiM6Zylvm",
      "name": "Work List",
      "owner": "WR6vgmLUT8cjjRtGXr31zhRV5d03"
    }
  }
}
```

### `events` Collection
Each event contains the following attributes:

- `uid`: (string) Unique identifier for the event generated by Firebase.
- `title`: (string) Title of the event.
- `description`: (string) description of the event.
- `owner`: (string) the uid of the user who created the post.
- `participants`: (array) List of user IDs (UIDs) who are part of this event.
- `startDate`: (string) The date and time of the starting date for the event.
- `endDate`: (string) The date and time of the ending date for the event. 

**Example structure:**
```json
{
  "events": {
    "OMCOB0kotA6mHCpsRQ5": {
      "description": "This the description",
      "endDate": "2025-03-25T16:01", 
      "owner": "random user ID", 
      "participants": {
        "0": "If only one participant, this is the ID of the owner"
      }, 
      "private": false, 
      "startDate": "2025-03-25T15:01", 
      "title": "My first event"
    }
  }
}

//If Recurring event is created

{
  "events": {
    "OMCOB0kotA6mHCpsRQ5": {
      "description": "This the description",
      "endDate": "2025-03-25T16:01", 
      "owner": "random user ID", 
      "participants": {
        "0": "If only one participant, this is the ID of the owner"
      }, 
      "private": false,
      "recurrance": {
        frequency: "monthly",
        interval: "1"
      },
      "startDate": "2025-03-25T15:01", 
      "title": "My first event"
    }
  }
}
```

### `users` Collection
Each user contains the following attributes:

- `uid`: (string) Unique identifier for the user generated by Firebase.
- `handle`: (string) Username or handle chosen by the user.
- `firstName`: (string) First name of the user.
- `lastName`: (string) Last name of the user.
- `role`: (string) Role assigned to the user (e.g., `admin`, `user`, `banned`).
- `phone`: (string) Phone number of the user.
- `email`: (string) Email address of the user.
- `createdOn`: (timestamp) Date and time when the user account was created.
- `profilePicture`: (link) Link to the uploaded image in our Firebase Storage

**Example structure:**
```json
{
    "users": {
        "userHandle": {
            "uid": "user123",
            "handle": "john_doe",
            "firstName": "John",
            "lastName": "Doe",
            "role": "admin",
            "phone": "0898989898",
            "profilePicture": "https://firebasestorage.googleapis.com/v0/b/eventcalendar.firebasestorage.app/....."
            "email": "johndoe@example.com",
            "createdOn": "2025-02-18T08:45:00Z"
        }
    }
}
```

## Key Features
- Real-time synchronization using Firebase listeners
- Hierarchical data structure for efficient queries
- Role-based access control

## Security

- We have created a .env file where we store all sensitive information related to the database
- This file is local for every developer and is generally added to the .gitignore so that no unauthorized user can have full db access
- Upon request, the file can be provided to anyone who wishes to run or review the project locally

## GIT

- We used GIT Issues board to structure all tasks

## Visual representation

- This project is our first endeavour into Tailwind CSS in combination with Daisy UI

## Main responsibilities for each team member

- Radoslav Kalushkov - Implementing authentication - Login, Home, Register, Profile editing, Profile page, Admin functionalities, Event Creation, Event Search and Event editing/deletion functionalities, implementation of Tailwind and daisy ui in the project.
- Georgi Popov - Handled the Calendar views and their rendering functionalities for the events
- Maria Mutafova - Creating contact lists and integrating them in the event creation process
- Every team member added their own visual ideas for the app presentation and was part of the bug fixing process

## Missing features

-User addresses and local weather API integration as a bonus feature for now
