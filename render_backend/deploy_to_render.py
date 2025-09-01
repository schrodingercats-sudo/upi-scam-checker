#!/usr/bin/env python3
"""
Deployment Configuration for Render
This script helps set up the Render deployment
"""

import json
import os

def create_render_config():
    """Create Render deployment configuration"""
    
    # Render.json configuration
    render_config = {
        "name": "upi-scam-checker-backend",
        "type": "web",
        "buildCommand": "pip install -r requirements.txt",
        "startCommand": "python app.py",
        "envVars": [
            {
                "key": "GOOGLE_GEMINI_API_KEY",
                "sync": False
            },
            {
                "key": "RETRAIN_KEY",
                "sync": False
            },
            {
                "key": "PORT",
                "value": "5000"
            }
        ],
        "healthCheckPath": "/health",
        "autoDeploy": True
    }
    
    # Write to render.json
    with open('render.json', 'w') as f:
        json.dump(render_config, f, indent=2)
    
    print("Render configuration created successfully!")
    print("Configuration details:")
    print(f"  Name: {render_config['name']}")
    print(f"  Type: {render_config['type']}")
    print(f"  Build Command: {render_config['buildCommand']}")
    print(f"  Start Command: {render_config['startCommand']}")
    print(f"  Health Check Path: {render_config['healthCheckPath']}")
    print("\nEnvironment Variables to set in Render dashboard:")
    for env_var in render_config['envVars']:
        if not env_var.get('sync', True):
            print(f"  - {env_var['key']}")

def update_deployment_info():
    """Update deployment information"""
    
    deployment_info = {
        "project_name": "UPI Scam Checker Backend",
        "version": "3.0.0",
        "deployment_platform": "Render",
        "database": "SQLite (feedback.db)",
        "features": [
            "Real-time SMS analysis",
            "User feedback collection",
            "Model retraining with feedback",
            "Persistent storage with SQLite",
            "API endpoints for frontend integration"
        ],
        "api_endpoints": [
            "/health - Health check",
            "/analyze - SMS analysis",
            "/feedback - Store user feedback",
            "/stats - Get feedback statistics",
            "/retrain - Retrain model (protected)"
        ],
        "environment_variables": [
            "GOOGLE_GEMINI_API_KEY",
            "RETRAIN_KEY",
            "PORT=5000"
        ],
        "files_included": [
            "app.py",
            "requirements.txt",
            "runtime.txt",
            "gunicorn.conf.py",
            "engine/simple_analyzer.py",
            "engine/database.py",
            "engine/retrain_model.py"
        ]
    }
    
    with open('DEPLOYMENT_INFO.json', 'w') as f:
        json.dump(deployment_info, f, indent=2)
    
    print("Deployment information updated!")

if __name__ == "__main__":
    try:
        create_render_config()
    except Exception as e:
        print(f"Error creating render config: {e}")
    
    try:
        update_deployment_info()
    except Exception as e:
        print(f"Error updating deployment info: {e}")
    
    print("\n✅ Render deployment setup completed!")
    print("Next steps:")
    print("1. Push changes to your GitHub repository")
    print("2. Connect your repository to Render")
    print("3. Set environment variables in Render dashboard")
    print("4. Deploy your application")