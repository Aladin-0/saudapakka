# services.py

import os
import requests
import xml.etree.ElementTree as ET
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class SandboxClient:
    def __init__(self):
        self.api_key = settings.SANDBOX_API_KEY
        self.api_secret = settings.SANDBOX_API_SECRET
        self.base_url = 'https://api.sandbox.co.in'
        self.access_token = None

    def _authenticate(self):
        """Step 1: Get JWT Access Token (Valid for 24 hours)"""
        url = f"{self.base_url}/authenticate"
        headers = {
            'x-api-key': self.api_key,
            'x-api-secret': self.api_secret,
            'x-api-version': '1.0',
            'Content-Type': 'application/json'
        }
        try:
            response = requests.post(url, headers=headers, timeout=15)
            if response.status_code == 200:
                self.access_token = response.json().get('data', {}).get('access_token')
                return True
            logger.error(f"Sandbox Auth Failed: {response.text}")
            return False
        except Exception as e:
            logger.error(f"Sandbox Auth Exception: {e}")
            return False

    def initiate_digilocker(self, redirect_url):
        """Step 2: Start DigiLocker Session"""
        if not self.access_token and not self._authenticate():
            return {'code': 500, 'message': 'Authentication failed'}

        url = f"{self.base_url}/kyc/digilocker/sessions/init"
        payload = {
            "@entity": "in.co.sandbox.kyc.digilocker.session.request",
            "flow": "signin",
            "doc_types": ["aadhaar"],
            "redirect_url": redirect_url
        }
        headers = {
            'Authorization': self.access_token,
            'x-api-key': self.api_key,
            'Content-Type': 'application/json'
        }
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=20)
            data = response.json()
            if response.status_code == 200:
                return {
                    'code': 200,
                    'data': {
                        'entity_id': data['data']['session_id'],
                        'digilocker_url': data['data']['authorization_url']
                    }
                }
            return {'code': response.status_code, 'message': data.get('message')}
        except Exception as e:
            return {'code': 500, 'message': str(e)}

    def get_kyc_status(self, entity_id):
        """Step 3: Check status and pull Aadhaar XML if ready"""
        if not self.access_token and not self._authenticate():
            return {'code': 500, 'message': 'Auth failed'}

        url = f"{self.base_url}/kyc/digilocker/sessions/{entity_id}/documents/aadhaar"
        headers = {
            'Authorization': self.access_token,
            'x-api-key': self.api_key,
            'x-api-version': '1.0'
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=20)
            res_data = response.json()
            
            # print(f"DEBUG SANDBOX DATA: {res_data}")

            # Case A: JSON Data provided directly
            if response.status_code == 200 and 'aadhaar_data' in res_data.get('data', {}):
                return {'code': 200, 'data': res_data['data']}

            # Case B: XML File URL provided (Common for UIDAI)
            files = res_data.get('data', {}).get('files', [])
            if response.status_code == 200 and len(files) > 0:
                file_url = files[0].get('url')
                # print(f"DEBUG: Downloading XML from {file_url}")
                xml_res = requests.get(file_url, timeout=20)
                # Call the parser method defined below
                return self._parse_aadhaar_xml(xml_res.text)
            
            return {'code': 202, 'message': 'Processing'}
            
        except Exception as e:
            logger.error(f"Sandbox Fetch Error: {e}")
            return {'code': 500, 'message': str(e)}

    def _parse_aadhaar_xml(self, xml_content):
        """Step 4: Extract identity from Government XML"""
        try:
            if isinstance(xml_content, str):
                xml_content = xml_content.encode('utf-8')
            
            root = ET.fromstring(xml_content)
            
            # Locate Identity (Poi) and Address (Poa) tags
            poi = root.find('.//Poi')
            poa = root.find('.//Poa')
            
            if poi is None:
                return {'code': 400, 'message': 'Poi data missing in Aadhaar XML'}

            return {
                'code': 200,
                'data': {
                    'aadhaar_data': {
                        'name': poi.get('name'),
                        'dob': poi.get('dob'),
                        'gender': poi.get('gender'),
                        'address': {
                            'house': poa.get('house') if poa is not None else "",
                            'dist': poa.get('dist') if poa is not None else "",
                            'state': poa.get('state') if poa is not None else "",
                            'pc': poa.get('pc') if poa is not None else ""
                        }
                    }
                }
            }
        except Exception as e:
            logger.error(f"XML Parse Error: {e}")
            return {'code': 500, 'message': 'Failed to parse identity document'}