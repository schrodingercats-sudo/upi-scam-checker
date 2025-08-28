#!/bin/bash

echo "========================================"
echo "Advanced UPI Fraud Detection System Setup"
echo "========================================"
echo

echo "Installing Python dependencies..."
pip3 install -r requirements_advanced.txt

echo
echo "Testing the advanced system..."
cd engine
python3 test_advanced_system.py

echo
echo "Setup completed!"
echo "You can now use the advanced ML system in your UPI Guard app."
