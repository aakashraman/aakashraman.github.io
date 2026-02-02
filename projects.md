---
layout: default
title: Projects
---

# Projects

A collection of cybersecurity tools, scripts, and automation projects focused on Blue Team operations, threat detection, and security orchestration.

---

## GoPhish Auto Deploy Script

**Repository:** [github.com/aakashraman/GoPhish-Deployment](https://github.com/aakashraman/GoPhish-Deployment)

**Description:**  
Quick script to deploy GoPhish setup when used with a DigitalOcean droplet + NameCheap Domain Registrar combination.

This script automates the deployment of GoPhish, a powerful open-source phishing framework. It supports SSL certificate generation with Let's Encrypt (Certbot) and optionally integrates with the Namecheap API for DNS automation.

**Features:**
- ✅ Installs required system packages (`unzip`, `certbot`)
- ✅ Downloads and extracts the latest GoPhish release
- ✅ Configures `config.json` with external admin access on `0.0.0.0:3333`
- ✅ SSL certificate and key paths configuration
- ✅ Generates SSL certificates via Certbot using DNS challenge
- ✅ (Optional) Automates Namecheap DNS TXT record creation
- ✅ Launches the GoPhish binary and logs output

**Tech Stack:** Python 3.6+, Ubuntu/Debian, Certbot, Namecheap API

**Use Case:** Automated deployment of phishing simulation infrastructure for security awareness training and red team exercises.

---

## SOAR Python Scripts

**Description:**  
Sample Python scripts for a wide variety of Security Orchestration, Automation & Response (SOAR) use cases.

**Capabilities:**

### 1. Extracting Indicators from Emails
Automated extraction of IOCs (Indicators of Compromise) from email headers, body content, and attachments. Supports various email formats and threat intelligence enrichment.

### 2. Automated Threat Intelligence Lookup
Integration with multiple threat intelligence feeds to automatically enrich IP addresses, domains, file hashes, and URLs. Supports VirusTotal, AbuseIPDB, and other TI sources.

### 3. Phishing URL Detection
Automated analysis of URLs to detect phishing attempts using multiple techniques:
- Domain reputation checking
- URL pattern analysis
- Screenshot comparison
- Machine learning-based classification

### 4. Automated IP Blocking
Integration with firewall and network security devices to automatically block malicious IP addresses based on threat intelligence feeds and security alerts.

### 5. Generating Incident Reports
Automated generation of comprehensive incident reports in multiple formats (PDF, JSON, HTML) with:
- Timeline reconstruction
- IOC extraction and correlation
- Impact assessment
- Remediation recommendations
- Executive summaries

**Tech Stack:** Python, REST APIs, Security Orchestration Platforms

**Use Case:** SOC automation, incident response acceleration, and security operations efficiency improvement.

---

## Other Projects

### Visualizing Lateral Movement with Velociraptor JSON Logs
Analysis and visualization tool for tracking lateral movement patterns in enterprise environments using Velociraptor forensic data.

### Android Malware Analysis Research Paper
Research project analyzing trends and techniques in Android malware, focusing on detection and analysis methodologies.

### Performing Forensic Analysis on a Suspected Malware Disk Image
Digital forensics project involving disk image analysis, malware identification, and evidence extraction.

### Performing Penetration Testing and Incident Response for Horizon Inc
Comprehensive security assessment including penetration testing, incident response, and security posture improvement.

### Designing a Secure Cloud Security Architecture for Cobra Kai
Cloud security architecture design project focusing on multi-cloud environments, zero-trust principles, and defense-in-depth strategies.

---

## Project Philosophy

All projects follow these principles:
- **Defense-First Approach:** Focus on detection and prevention
- **Automation:** Reduce manual effort and response time
- **Open Source:** Share knowledge with the security community
- **Practical Application:** Real-world use cases and scenarios
- **Purple Team Mindset:** Understanding both offensive and defensive perspectives

---

*For more projects and contributions, visit my [GitHub profile](https://github.com/aakashraman).*
