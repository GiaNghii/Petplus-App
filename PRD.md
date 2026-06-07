# Petplus Mobile App - Product Requirements Document (PRD)

**Version:** 1.0
**Date:** June 6, 2026
**Author:** Marketing Mobile Project Team
**Brand:** Petplus (https://petplus.com.vn/)

## 1. Problem Statement

Petplus is a 24/7 veterinary clinic chain with 3 branches in Ho Chi Minh City (Go Vap, District 11, District 12). Currently operating on traditional model, Petplus faces several critical issues:

- **Lack of transparency**: Customers don't know what medications their pets are using, dosages, or treatment details
- **No reminder system**: Customers easily forget follow-up appointments, vaccination schedules, and medication times
- **Convenience issues**: Customers must bring pets to clinic just to buy medicine for minor problems
- **Disconnected records**: Doctors must ask for information repeatedly, customers cannot access their pet's medical history
- **Manual booking**: No online appointment system, causing long wait times and inefficient doctor scheduling

## 2. Solution Overview

Mobile app connecting Petplus customers and veterinarians, enabling:
- Book clinic appointments with doctor selection and time slots
- 24/7 online consultation via chat
- Purchase medications (OTC and prescription) with delivery within Ho Chi Minh City
- Smart reminders through multiple channels (Push, Zalo, SMS)
- Pet health profile management with medical history

## 3. Target Users

| Role | Description | Primary Needs |
|------|-------------|---------------|
| **Customer (Pet Owner)** | Pet owners who manage multiple pets. Can browse without login, login required for booking and purchasing. | Book appointments, consult vets, buy medicine, track pet health, receive reminders |
| **Doctor (Veterinarian)** | Petplus vets on 24/7 duty at specific branches. Consult via chat, prescribe medications, manage branch appointments. | Chat with customers, prescribe via chat links, view daily schedule, manage consultations |

## 4. Core Features

### 4.1 Pet Health Profile
- **Multiple pets per account** (each customer can manage unlimited pets)
- **Pet information**: name, species (dog/cat/other), breed, weight, birth date, medical history, drug allergies, vaccination history, avatar photo
- **Records updated after each appointment** automatically
- **Medical timeline** showing all visits, treatments, and progress

### 4.2 Book Appointment at Clinic

**Booking Flow:**
1. Customer selects **branch** (Go Vap / District 11 / District 12)
2. Selects **doctor** or lets system auto-assign
3. Selects **time slot** (2 hours per slot)
4. System validates: slot has < 3 patients?
   - **Full (3/3)** → Error message, suggest alternative doctors/slots/branches
   - **Available** → Confirm booking

**Rules:**
- Each slot: 2 hours
- Max 3 patients per slot per doctor
- Must book at least 2 hours in advance
- Cancel up to 2 hours before appointment, no fee
- Customer selects pet for the appointment

### 4.3 Online Consultation (Chat)

**Consultation Flow:**
1. Customer selects **pet** needing consultation
2. Chooses **specific doctor** or lets system auto-assign available doctor
3. If doctor is busy at that time:
   - Show notification: "Bác sĩ đang bận, có thể reply trễ. Bạn có chấp nhận chờ?"
   - **Yes** → Chat with selected doctor
   - **No** → Redirect to first available doctor
4. Real-time chat with image sharing

**Doctor Side:**
- View list of waiting customers
- Accept chat or redirect to colleague
- Send product links as prescriptions
- View pet health profile during chat

### 4.4 Purchase Medicine

| Type | Process |
|------|---------|
| **OTC (No prescription)** | Browse and add to cart directly |
| **Prescription** | Doctor sends product link in chat → System recognizes as prescription for selected pet → Customer taps "Buy" → Warning popup → Confirm → Add to cart |

**Warning Popup Text:**
> "Đảm bảo thuốc này được sử dụng cho đúng thú cưng được kê đơn, không sử dụng cho các thú cưng khác để tránh các trường hợp xấu có thể xảy ra"

### 4.5 Payment Methods
- **Momo QR** (Petplus bears transaction fees)
- **Bank transfer** (manual confirmation)
- **COD (Cash on Delivery)**

### 4.6 Delivery
- **Delivery area**: Within Ho Chi Minh City
- **Fulfillment**: From nearest branch that has stock
- **Packaging**: Staff packages at branch, hands to delivery partner
- **Pickup option**: Customer can pick up at branch
- **Delivery partners**: GrabExpress, GHTK, GHN (integration or manual)

### 4.7 Smart Reminders
**Channels:** Push notification + Zalo OA + SMS

**Reminder types:**
- Follow-up appointment
- Medication time
- Vaccination schedule
- Deworming schedule
- Diet change based on age/weight

**Triggered by:**
- Doctor sets during appointment
- Automatic based on prescription dates
- Pet age milestones

### 4.8 Order Tracking
- View order history
- Track delivery status (pending → preparing → shipped → delivered)
- Reorder from history
- Order cancellation before shipping

## 5. Business Rules

### 5.1 Appointment Rules
| Rule | Detail |
|------|--------|
| Slot duration | 2 hours |
| Max patients/slot | 3 |
| Advance booking | Minimum 2 hours |
| Cancellation | Up to 2 hours before, no fee |
| Doctor assignment | Customer chooses or auto-assign |
| Branch scope | 3 branches (Go Vap, District 11, District 12) |

### 5.2 Prescription Rules
- Doctor sends product link in chat = valid prescription
- Prescription automatically linked to selected pet in consultation
- Warning popup required before adding prescription to cart
- No additional doctor approval needed after link sent

### 5.3 Payment Rules
- Momo: Petplus bears transaction fees
- COD: Available for all orders
- Bank transfer: Manual confirmation by staff

### 5.4 Delivery Rules
- Within Ho Chi Minh City only
- From nearest branch with stock
- Staff package at branch
- Customer can choose pickup instead

## 6. Non-Functional Requirements

| Requirement | Detail |
|-------------|--------|
| **Language** | Vietnamese only |
| **Operating hours** | 24/7 (clinic), app available always |
| **Platform** | iOS and Android (via React Native) |
| **Performance** | App launch < 3 seconds, chat messages < 1 second delivery |
| **Offline support** | Basic browsing, view cached pet profiles and appointments |
| **Security** | Firebase Authentication, Firestore security rules, HIPAA-like data protection for pet records |
| **Accessibility** | Font sizes adjustable, high contrast mode |
| **Analytics** | Firebase Analytics for user behavior tracking |

## 7. Tech Stack

| Component | Technology | Reason |
|-----------|------------|--------|
| **Mobile App** | React Native + Expo | Cross-platform, one codebase, large community, fast prototyping |
| **Backend** | Firebase | Built-in auth, database, storage, notifications, serverless functions |
| **Database** | Firestore | Real-time sync, offline support, easy querying |
| **Authentication** | Firebase Auth | Email/password, Google sign-in |
| **File Storage** | Firebase Storage | Pet photos, prescription images |
| **Push Notifications** | Firebase Cloud Messaging | Reliable, integrated with Firebase ecosystem |
| **Zalo Integration** | Zalo OA API | Official Account for reminders |
| **SMS** | Twilio or local provider | SMS reminders |
| **Payment** | Momo API | QR code payments |
| **Web Dashboard** | React + Vercel | Doctor appointment management on desktop |
| **Hosting** | Vercel (web), Firebase (app backend) | Free tier, reliable |

## 8. Data Model

### 8.1 Firestore Collections

```
branches/{branchId}
  - name: string ("Go Vap" | "District 11" | "District 12")
  - address: string
  - phone: string
  - openingHours: string ("24/7")
  - activeDoctors: array<doctorId>

users/{userId}
  - email: string
  - name: string
  - phone: string
  - role: string ("customer" | "doctor")
  - avatarUrl: string
  - branchId: string (for doctors)
  - createdAt: timestamp

pets/{petId}
  - ownerId: string
  - name: string
  - species: string ("dog" | "cat" | "other")
  - breed: string
  - weight: number
  - birthDate: timestamp
  - medicalHistory: string
  - drugAllergies: array<string>
  - vaccinationHistory: array<{name: string, date: timestamp}>
  - avatarUrl: string
  - createdAt: timestamp

appointments/{appointmentId}
  - branchId: string
  - doctorId: string
  - petId: string
  - customerId: string
  - dateTime: timestamp
  - slot: string (e.g., "09:00-11:00")
  - status: string ("pending" | "confirmed" | "completed" | "cancelled")
  - notes: string
  - createdAt: timestamp
  - updatedAt: timestamp

consultations/{consultationId}
  - customerId: string
  - doctorId: string
  - petId: string
  - status: string ("waiting" | "active" | "closed")
  - createdAt: timestamp
  - updatedAt: timestamp

messages/{messageId}
  - consultationId: string
  - senderId: string
  - senderRole: string ("customer" | "doctor")
  - text: string
  - productLink: string (optional)
  - imageUrl: string (optional)
  - createdAt: timestamp

products/{productId}
  - name: string
  - description: string
  - price: number
  - imageUrl: string
  - type: string ("OTC" | "prescription")
  - category: string
  - stock: map<branchId, number>
  - createdAt: timestamp

orders/{orderId}
  - customerId: string
  - items: array<{productId, quantity, price, type: "OTC" | "prescription", petId?: string}>
  - totalAmount: number
  - deliveryFee: number
  - paymentMethod: string ("momo" | "banking" | "COD")
  - paymentStatus: string ("pending" | "paid" | "failed")
  - deliveryBranch: string
  - deliveryAddress: string
  - deliveryType: string ("delivery" | "pickup")
  - status: string ("pending" | "preparing" | "shipped" | "delivered" | "cancelled")
  - createdAt: timestamp
  - updatedAt: timestamp

reminders/{reminderId}
  - customerId: string
  - petId: string
  - type: string ("checkup" | "medicine" | "vaccination" | "deworming" | "diet")
  - title: string
  - description: string
  - dateTime: timestamp
  - channels: array<string> ("push" | "zalo" | "sms")
  - status: string ("pending" | "sent" | "completed")
  - createdAt: timestamp
```

## 9. Out of Scope (Phase 1)

The following features are NOT included in initial version:

- **Direct Momo integration** (QR code display only, manual confirmation via transfer)
- **AI chatbot** for automatic customer responses
- **Spa/Grooming booking** system
- **Membership program** / loyalty points
- **Video call** with doctors
- **Advanced analytics** and revenue reporting
- **Multi-language support** (Vietnamese only)
- **In-app payment** with card processing
- **Real-time delivery tracking** (status updates only, no GPS)
- **Insurance claims** integration

## 10. Success Metrics

| Metric | Target |
|--------|--------|
| App downloads | 1,000 in first 3 months |
| Daily active users | 200 |
| Appointment bookings via app | 50% of total bookings |
| Online consultation usage | 30 consultations/day |
| Medicine orders | 50 orders/week |
| Customer satisfaction | >4.5/5 stars |
| Reminder effectiveness | 80% appointment show rate |

## 11. Timeline & Milestones

| Phase | Duration | Features |
|-------|----------|----------|
| **Phase 1: Foundation** | Weeks 1-2 | Project setup, auth, pet profiles, basic UI |
| **Phase 2: Core** | Weeks 3-4 | Booking, chat, doctor dashboard |
| **Phase 3: Commerce** | Weeks 5-6 | Medicine shop, cart, payment, delivery |
| **Phase 4: Polish** | Weeks 7-8 | Reminders, notifications, testing, deployment |

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Firebase free tier limits | High | Monitor usage, upgrade to Blaze plan if needed |
| Doctor adoption | Medium | Training sessions, simple UI, dedicated tablet app |
| Customer learning curve | Low | Onboarding tutorial, simple flow, help section |
| Data privacy concerns | Medium | Clear privacy policy, data encryption, compliance |
| Network connectivity in clinic | Low | Offline mode, WiFi setup at branches |

---

**Document Control:**
- Version history tracked in git
- Reviewed by: Project team
- Approved by: [To be filled]
- Last updated: June 6, 2026
