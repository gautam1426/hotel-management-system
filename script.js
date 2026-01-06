// Hotel Management System - JavaScript

class Hotel {
    constructor(name) {
        this.name = name;
        this.rooms = {};
        this.bookings = {};
    }

    addRoom(roomNumber, roomType, price) {
        if (this.rooms[roomNumber]) {
            return { success: false, message: `Room ${roomNumber} already exists!` };
        }

        this.rooms[roomNumber] = {
            type: roomType,
            price: price,
            booked: false,
            customer: null
        };

        return { success: true, message: `Room ${roomNumber} added successfully.` };
    }

    bookRoom(customerName, roomNumber) {
        if (!this.rooms[roomNumber]) {
            return { success: false, message: `Room ${roomNumber} doesn't exist!` };
        }

        if (this.rooms[roomNumber].booked) {
            return { success: false, message: `Room ${roomNumber} is already booked!` };
        }

        this.rooms[roomNumber].booked = true;
        this.rooms[roomNumber].customer = customerName;
        this.bookings[customerName] = roomNumber;

        return { 
            success: true, 
            message: `${customerName} successfully booked Room ${roomNumber}!`,
            bookingInfo: {
                customer: customerName,
                roomNumber: roomNumber,
                roomType: this.rooms[roomNumber].type,
                price: this.rooms[roomNumber].price
            }
        };
    }

    checkoutRoom(customerName) {
        if (!this.bookings[customerName]) {
            return { success: false, message: `No booking found for ${customerName}!` };
        }

        const roomNumber = this.bookings[customerName];
        this.rooms[roomNumber].booked = false;
        this.rooms[roomNumber].customer = null;
        delete this.bookings[customerName];

        return { 
            success: true, 
            message: `${customerName} has checked out from Room ${roomNumber}.`,
            roomNumber: roomNumber
        };
    }

    getAllRooms() {
        return this.rooms;
    }

    getAvailableRooms() {
        return Object.entries(this.rooms)
            .filter(([_, room]) => !room.booked)
            .reduce((acc, [number, room]) => {
                acc[number] = room;
                return acc;
            }, {});
    }

    getBookings() {
        return Object.entries(this.bookings).map(([customer, roomNumber]) => {
            return {
                customer: customer,
                roomNumber: roomNumber,
                roomType: this.rooms[roomNumber].type,
                price: this.rooms[roomNumber].price
            };
        });
    }
}

// UI Implementation
document.addEventListener('DOMContentLoaded', function() {
    // Initialize hotel
    const hotel = new Hotel("Grand Palace Hotel");
    
    // Add some sample rooms
    hotel.addRoom(101, "Standard Single", 99);
    hotel.addRoom(102, "Standard Double", 149);
    hotel.addRoom(201, "Deluxe Suite", 249);
    hotel.addRoom(202, "Executive Suite", 349);
    hotel.addRoom(301, "Presidential Suite", 599);

    // DOM Elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const roomsContainer = document.getElementById('rooms-container');
    const bookingsTable = document.querySelector('#bookings-table tbody');
    const addRoomForm = document.getElementById('add-room-form');
    const checkoutForm = document.getElementById('checkout-form');
    const bookingForm = document.getElementById('booking-form');
    const bookingModal = document.getElementById('booking-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const showAllBtn = document.getElementById('show-all');
    const showAvailableBtn = document.getElementById('show-available');

    // Current room display mode ('all' or 'available')
    let roomDisplayMode = 'all';
    let currentRoomForBooking = null;

    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            
            // Refresh data if needed
            if (tabId === 'rooms') {
                refreshRoomsDisplay();
            } else if (tabId === 'bookings') {
                refreshBookingsDisplay();
            }
        });
    });

    // Room display filter buttons
    showAllBtn.addEventListener('click', () => {
        roomDisplayMode = 'all';
        refreshRoomsDisplay();
        showAllBtn.classList.add('active');
        showAvailableBtn.classList.remove('active');
    });

    showAvailableBtn.addEventListener('click', () => {
        roomDisplayMode = 'available';
        refreshRoomsDisplay();
        showAvailableBtn.classList.add('active');
        showAllBtn.classList.remove('active');
    });

    // Add new room form
    addRoomForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const roomNumber = parseInt(document.getElementById('room-number').value);
        const roomType = document.getElementById('room-type').value;
        const roomPrice = parseFloat(document.getElementById('room-price').value);
        
        const result = hotel.addRoom(roomNumber, roomType, roomPrice);
        
        if (result.success) {
            showAlert('success', result.message);
            this.reset();
            refreshRoomsDisplay();
        } else {
            showAlert('error', result.message);
        }
    });

    // Checkout form
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const customerName = document.getElementById('customer-name').value;
        const result = hotel.checkoutRoom(customerName);
        
        if (result.success) {
            showAlert('success', result.message);
            this.reset();
            refreshRoomsDisplay();
            refreshBookingsDisplay();
        } else {
            showAlert('error', result.message);
        }
    });

    // Booking modal
    function openBookingModal(roomNumber) {
        currentRoomForBooking = roomNumber;
        const room = hotel.getAllRooms()[roomNumber];
        
        document.getElementById('modal-room-number').value = roomNumber;
        document.getElementById('modal-room-type').textContent = room.type;
        document.getElementById('modal-room-price').textContent = room.price;
        
        bookingModal.style.display = 'flex';
    }

    closeModalBtn.addEventListener('click', () => {
        bookingModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            bookingModal.style.display = 'none';
        }
    });

    // Booking form
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const customerName = document.getElementById('booking-customer-name').value;
        const roomNumber = parseInt(document.getElementById('modal-room-number').value);
        
        const result = hotel.bookRoom(customerName, roomNumber);
        
        if (result.success) {
            showAlert('success', result.message);
            this.reset();
            bookingModal.style.display = 'none';
            refreshRoomsDisplay();
            refreshBookingsDisplay();
        } else {
            showAlert('error', result.message);
        }
    });

    // Helper functions
    function refreshRoomsDisplay() {
        roomsContainer.innerHTML = '';
        
        const rooms = roomDisplayMode === 'all' ? 
            hotel.getAllRooms() : 
            hotel.getAvailableRooms();
        
        for (const [number, room] of Object.entries(rooms)) {
            const roomCard = document.createElement('div');
            roomCard.className = 'room-card';
            
            roomCard.innerHTML = `
                <h3>Room ${number}</h3>
                <p>Type: ${room.type}</p>
                <p>Price: $${room.price}/night</p>
                <span class="status ${room.booked ? 'booked' : 'available'}">
                    ${room.booked ? 'Booked' : 'Available'}
                </span>
                <button class="book-btn" ${room.booked ? 'disabled' : ''}>
                    Book Room
                </button>
            `;
            
            if (!room.booked) {
                roomCard.querySelector('.book-btn').addEventListener('click', () => {
                    openBookingModal(number);
                });
            }
            
            roomsContainer.appendChild(roomCard);
        }
    }

    function refreshBookingsDisplay() {
        bookingsTable.innerHTML = '';
        
        const bookings = hotel.getBookings();
        
        if (bookings.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="4" style="text-align: center;">No current bookings</td>';
            bookingsTable.appendChild(row);
            return;
        }
        
        for (const booking of bookings) {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${booking.customer}</td>
                <td>${booking.roomNumber}</td>
                <td>${booking.roomType}</td>
                <td>$${booking.price}</td>
            `;
            
            bookingsTable.appendChild(row);
        }
    }

    function showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${type}`;
        alertDiv.textContent = message;
        
        const contentDiv = document.querySelector('.content');
        contentDiv.insertBefore(alertDiv, contentDiv.firstChild);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    // Initial display
    refreshRoomsDisplay();
    refreshBookingsDisplay();
});