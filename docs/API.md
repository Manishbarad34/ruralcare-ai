# 🔌 RuralCare AI - REST API & WebSocket Specifications

## 🌐 REST API Endpoints

### 1. `GET /api/store`
- **Description**: Retrieves full system state (doctors, villagers, queue, mailbox, inventory).
- **Response**: `200 OK`

### 2. `POST /api/register-doctor`
- **Description**: Registers a new doctor or updates active session.
- **Body**: `{ name, licenseNo, specialty, experience, password }`
- **Response**: `200 OK`

### 3. `POST /api/register-villager`
- **Description**: Registers a new rural patient.
- **Body**: `{ name, age, gender, village, phone, bloodGroup, allergies, password }`
- **Response**: `200 OK`

### 4. `POST /api/request-approval`
- **Description**: Submits a patient consultation request to a doctor's approval mailbox.
- **Body**: `{ villagerId, villagerName, doctorId, doctorName, symptoms, emergencyLevel }`
- **Response**: `200 OK`

### 5. `POST /api/update-approval`
- **Description**: Updates approval mailbox status (`APPROVED`, `DECLINED`, `LATER`).
- **Body**: `{ requestId, status }`
- **Response**: `200 OK`

---

## 📡 WebSocket Signaling Events (`ws://localhost:5000`)
- `data-update`: Broadcasts central store mutations to all connected clients.
- `offer`, `answer`, `ice-candidate`: 2-Way WebRTC video call peer exchange signals.
