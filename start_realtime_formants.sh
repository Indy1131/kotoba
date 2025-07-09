#!/bin/bash

# Kotoba App Startup Script

echo "🎤 Starting Kotoba Real-Time Formant Analysis App..."
echo "=================================================="

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up cleanup on script exit
trap cleanup EXIT

# Start backend server
echo "📡 Starting backend server..."
cd backend
"../../../../../../../.venv/bin/python" main.py &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 8

# Test backend health
echo "🏥 Testing backend health..."
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Start frontend server
echo "🌐 Starting frontend server..."
cd ..
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to initialize..."
sleep 5

echo "🚀 Both servers are running!"
echo "👀 Frontend: http://localhost:5174"
echo "🔧 Backend: http://localhost:5001"
echo "🎯 Real-time Formants: http://localhost:5174/realtime-formants"
echo ""
echo "📋 Instructions:"
echo "1. Navigate to http://localhost:5174/realtime-formants"
echo "2. Click 'Start Recording' to begin real-time analysis"
echo "3. Speak vowel sounds to see formants plotted in real-time"
echo "4. Different colors indicate confidence levels"
echo "5. Press Ctrl+C to stop both servers"
echo ""
echo "🔊 Make sure your microphone is enabled and working!"
echo "⌚ Press Ctrl+C to stop..."

# Keep script running
wait
