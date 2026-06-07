# Petplus

Petplus is a 24/7 veterinary clinic chain in Ho Chi Minh City, Vietnam, providing medical care, pet products, and online consultation services for pet owners.

## Users

**Customer (Pet Owner)**
Person who owns one or more pets and uses the app to manage their pets' health, book appointments, consult with doctors, and purchase pet products.

**Doctor (Veterinarian)**
Licensed veterinary professional employed by Petplus who works at a specific branch, provides consultations via chat, prescribes medications, and manages appointments.

## Branch

Physical clinic location of Petplus. Currently operating 3 branches:

- **Go Vap** ("Gò Vấp")
- **District 11** ("Quận 11")
- **District 12** ("Quận 12")

Each branch has a physical address, phone number, operating hours (24/7), and a team of assigned doctors.

## Pet (Thú cưng)

Animal under the care of a customer. A customer account can manage multiple pets.

**Attributes:**
- Name
- Species: dog ("Chó"), cat ("Mèo"), or other ("Khác")
- Breed ("Giống")
- Weight ("Cân nặng")
- Birth date ("Ngày sinh")
- Medical history ("Tiền sử bệnh")
- Drug allergies ("Dị ứng thuốc") - list of medications the pet cannot use
- Vaccination history ("Lịch tiêm phòng") - list of vaccines with dates
- Avatar photo

## Appointment (Lịch hẹn)

Scheduled visit to a Petplus clinic for in-person examination.

**Rules:**
- Customer must select a Branch, Doctor, and Time Slot
- Time Slot: 2-hour duration
- Maximum 3 patients per slot per doctor
- Must book at least 2 hours in advance
- Cancellation allowed up to 2 hours before appointment time, no penalty
- Customer must select which Pet the appointment is for

**Status:**
- Pending ("Chờ xác nhận") - newly created
- Confirmed ("Đã xác nhận") - doctor/staff confirmed
- Completed ("Hoàn thành") - appointment finished
- Cancelled ("Đã hủy") - cancelled by customer or system

## Time Slot

2-hour window for appointment scheduling. Examples: "07:00-09:00", "09:00-11:00", "11:00-13:00", etc.

## Consultation (Tư vấn)

Online chat session between a customer and a doctor for remote health advice.

**Flow:**
1. Customer selects a Pet needing consultation
2. Customer chooses a specific Doctor or lets system auto-assign
3. If chosen doctor is busy (has an appointment at that time), customer sees warning: "Bác sĩ đang bận, có thể reply trễ. Bạn có chấp nhận chờ?"
   - Yes: Chat with selected doctor
   - No: Redirect to first available doctor
4. Real-time messaging with text and image support

**Status:**
- Waiting ("Chờ tư vấn") - customer initiated, waiting for doctor
- Active ("Đang tư vấn") - doctor accepted and chatting
- Closed ("Kết thúc") - consultation ended

## Prescription (Đơn thuốc)

Medical authorization for a specific medication for a specific pet.

**Created by:** Doctor sends a product link in the chat during a consultation.

**Validation:** When doctor sends a product link in consultation chat, the system automatically recognizes this as a prescription for the Pet that was selected for that consultation. No additional approval needed.

**Purchase flow:**
1. Doctor sends product link in chat
2. Customer taps "Buy" ("Mua")
3. Warning popup appears: "Đảm bảo thuốc này được sử dụng cho đúng thú cưng được kê đơn, không sử dụng cho các thú cưng khác để tránh các trường hợp xấu có thể xảy ra"
4. Customer confirms and product is added to cart

## Product (Sản phẩm)

Item available for purchase in the Petplus shop.

**Types:**
- **OTC** ("Thuốc không cần đơn") - Can purchase without prescription
- **Prescription** ("Thuốc kê đơn") - Requires doctor prescription via chat

**Attributes:**
- Name
- Description
- Price
- Image
- Category
- Stock quantity per branch

## Order (Đơn hàng)

Customer purchase of one or more products.

**Payment methods:**
- Momo QR ("Momo") - Petplus bears transaction fees
- Bank transfer ("Chuyển khoản") - Manual confirmation
- COD ("Thanh toán khi nhận hàng") - Cash on delivery

**Status:**
- Pending ("Chờ thanh toán") - order created, awaiting payment
- Preparing ("Đang chuẩn bị") - staff packing at branch
- Shipped ("Đang giao") - handed to delivery partner
- Delivered ("Đã giao") - customer received
- Cancelled ("Đã hủy") - order cancelled

**Delivery:**
- Within Ho Chi Minh City only
- Fulfilled from nearest branch with available stock
- Staff packages at branch and hands to delivery partner (GrabExpress, GHTK, GHN)
- Customer can choose pickup at branch instead

## Reminder (Nhắc nhở)

Automated notification to customer about upcoming pet care events.

**Channels:**
- Push notification ("Thông báo app") - Firebase Cloud Messaging
- Zalo OA ("Zalo") - Petplus Official Account
- SMS ("Tin nhắn") - Text message

**Types:**
- Checkup ("Tái khám") - Follow-up appointment
- Medicine ("Uống thuốc") - Medication time
- Vaccination ("Tiêm phòng") - Vaccination schedule
- Deworming ("Tẩy giun") - Deworming schedule
- Diet ("Khẩu phần ăn") - Diet change based on pet age/weight

**Triggered by:**
- Doctor sets during appointment completion
- System calculates from prescription dates
- Pet age milestones

## Cart (Giỏ hàng)

Temporary holding place for products before checkout.

**Rules:**
- Can mix OTC and prescription items
- Prescription items must have valid prescription (from chat)
- Customer can adjust quantities or remove items
- Cart persists across sessions

## Payment (Thanh toán)

Process of paying for an order.

**Momo QR:**
- Customer scans QR code with Momo app
- Petplus bears transaction fees
- Manual confirmation by staff

**Bank Transfer:**
- Customer transfers to Petplus bank account
- Uploads receipt in app
- Staff manually confirms

**COD:**
- Pay cash when receiving delivery
- No upfront payment needed

## Language

**Vietnamese Terms:**
- Avoid: "Customer" → Use "Khách hàng"
- Avoid: "Doctor" → Use "Bác sĩ"
- Avoid: "Pet" → Use "Thú cưng"
- Avoid: "Appointment" → Use "Lịch hẹn"
- Avoid: "Prescription" → Use "Đơn thuốc"
- Avoid: "Order" → Use "Đơn hàng"
- Avoid: "Cart" → Use "Giỏ hàng"
- Avoid: "Checkout" → Use "Thanh toán"
- Avoid: "Delivery" → Use "Giao hàng"
- Avoid: "Pickup" → Use "Nhận tại cửa hàng"
- Avoid: "Branch" → Use "Chi nhánh"
- Avoid: "Vaccination" → Use "Tiêm phòng"
- Avoid: "Deworming" → Use "Tẩy giun"
- Avoid: "Medical record" → Use "Hồ sơ sức khỏe"
- Avoid: "Allergies" → Use "Dị ứng"
- Avoid: "Breed" → Use "Giống"

## Rules

- App operates 24/7 for booking and chat
- All times are in Vietnam timezone (UTC+7)
- Vietnamese language only for all user-facing content
- Customer can browse without login, but must login to book, chat, or buy
- Doctor can only view appointments at their assigned branch
- Prescription drugs require a doctor's link in chat - no other verification
- Cancellation is free up to 2 hours before appointment
- Orders are only delivered within Ho Chi Minh City
- Delivery is from the nearest branch with available stock
- Staff at branch handle packaging and handoff to delivery partner
