# ELD System  
![Screenshot (130)](https://github.com/user-attachments/assets/227500a3-2e3b-464f-b966-819e1fc7301f)



*_An Electronic Logging Device (ELD) solution for truck drivers_*  

---  

## 🚚 What is ELD System?  

The **ELD System** is a full-stack web application designed to assist truck drivers in planning trips while ensuring compliance with Hours of Service (HOS) regulations. Built with **Django** (backend) and **React** (frontend), it takes trip details as input, calculates routes, and generates detailed daily log sheets.  

### Key Features  
- **Trip Input**: Enter current location, pickup, dropoff, and cycle hours.  
- **Route Calculation**: Displays a map with markers.  
- **HOS Compliance**: Generates logs respecting 8-hour driving breaks, 11-hour daily limits, and 70-hour cycle rules.  
- **Deployment**: Hosted live on Vercel for easy access.  

---  

## 🛠️ How to Clone and Run Locally  

Follow these steps to get the project running on your machine:  

### Prerequisites  
- Python 3.8+ (for Django backend)  
- Node.js 16+ and npm (for React frontend)  
- Git  

### Steps  

1. **Clone the Repository**:  
   ```bash
   git clone https://github.com/fedhako7/electronic-logging-device.git
   cd electronic-logging-device
   
2. **Backend Setup (Django)**:
  ```bash
  cd rod_app
  python -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
  pip install -r requirements.txt
  python manage.py migrate
  python manage.py runserver
```
The backend will run on http://localhost:8000.

3. **Frontend Setup (React)**:
    ```bash
    cd ../rod-frontend
    npm install
    npm run dev
    ```
  Switch BASE_URL to local from rod-frontend/src/api/api.js.
  The frontend will run on http://localhost:5173 (default Vite port).




## 🌐 Live Demo  
Check out the live version of the app here: 👉 [https://fedesaeld.vercel.app/](https://fedesaeld.vercel.app/)  
Check out the video demo of the app here: 👉 [https://www.loom.com/share/282d060a2fe64329b5d1f8eff3f1d3b6?sid=2cd3b234-b07f-4221-b261-e2401fcb28ad](https://www.loom.com/share/282d060a2fe64329b5d1f8eff3f1d3b6?sid=2cd3b234-b07f-4221-b261-e2401fcb28ad)  


## 📋 Example Input

Here’s a sample input you can use to test the app:
```json
{
  "current_location": "Los Angeles, CA",
  "pickup_location": "Phoenix, AZ",
  "dropoff_location": "Dallas, TX",
  "cycle_hours": 0
}
```
Expected Output
**Route**: Displays a map for current, pick-up, and drop-off locations with markers.

**Logs**: Multi-day log sheets with driving, off-duty (e.g., 8-hr breaks, 10-hr rests), and on-duty (pickup, dropoff, fuel) segments.



## 📸 Screenshots
**Route and Map**:
_Map with markers_

![Screenshot (134)](https://github.com/user-attachments/assets/c0f919fb-9940-4a80-8831-7a276e4cdc24)





**Daily Logs**:
_Detailed HOS-compliant logs._

![Screenshot (131)](https://github.com/user-attachments/assets/6799e685-7050-486c-9808-c89a066785ce)




## 🌟 Future Improvements
  🔹 Enhance HOS compliance with stricter edge-case checks.
  
  🔹 Add remarks under the LogSheet for duty status changes with time and place.
  
  🔹 Recommend known locations for input fields to streamline entry using datalist.
  
  🔹 Implement Redis caching for OSRM API responses to improve performance.
  
  🔹 Add exportable PDF log sheets for drivers to download.

## 🧰 Tech Stack
  - **Backend**: Django, Django REST Framework, Nominatim (geocoding), OSRM (routing).
  
  - **Frontend**: React, Leaflet (map rendering).
  
  - **Deployment**: Vercel (frontend), Render (backend).
  
  - **Other**: Python, JavaScript, CORS for cross-origin requests.

## 📬 Contact
  **Email**: fedhasayelmachew@gmail.com

