#!/bin/bash

echo "🧪 Testing Real-Time Formant Analysis System"
echo "============================================="

# Test backend health
echo "🏥 Testing backend health..."
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ Backend is healthy"
    curl -s http://localhost:5001/health | jq '.'
else
    echo "❌ Backend not responding"
    exit 1
fi

# Test WebSocket connection
echo ""
echo "🔌 Testing WebSocket connection..."
if curl -s "http://localhost:5001/socket.io/?EIO=4&transport=polling" > /dev/null; then
    echo "✅ WebSocket endpoint is accessible"
else
    echo "❌ WebSocket endpoint not accessible"
fi

# Test formant references endpoint
echo ""
echo "📊 Testing formant references..."
curl -s "http://localhost:5001/api/audio/formant-references?speaker_type=male" | jq '.speaker_type, .vowel_references | keys'

# Test frontend accessibility
echo ""
echo "🌐 Testing frontend..."
if curl -s http://localhost:5174 > /dev/null; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend not accessible"
fi

echo ""
echo "🎯 Manual Test Instructions:"
echo "1. Open http://localhost:5174/realtime-formants"
echo "2. Check browser console for debug messages"
echo "3. Verify 'Connected' status shows green"
echo "4. Click 'Start Recording' and check console for:"
echo "   - 'Starting recording...'"
echo "   - 'Got media stream'"
echo "   - 'Created audio context'"
echo "   - 'Loaded audio worklet'"
echo "   - 'Connected audio nodes'"
echo "5. Speak vowel sounds and watch for formant updates"
echo ""
echo "🔧 Troubleshooting:"
echo "- If no connection: Check CORS errors in browser console"
echo "- If no audio: Check microphone permissions"
echo "- If no formants: Speak louder and clearer"
