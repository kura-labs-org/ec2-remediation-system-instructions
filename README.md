# EC2 Monitoring and Remediation System - ServiceNow Implementation

## Overview

**Company Context:** You're a ServiceNow Administrator at Netflix, where reliable streaming infrastructure is critical for delivering content to over 260 million subscribers worldwide. EC2 instances power Netflix's content delivery network, recommendation engines, and streaming services across multiple AWS regions.

**Your Role:** As a junior ServiceNow admin on the DevOps Engineering team, you've been tasked with building an automated incident response system that helps Netflix's DevOps engineers quickly remediate failing EC2 instances that could impact streaming quality for millions of viewers.

**Why This Matters:** Last week, a critical EC2 instance failure in the US-East region caused buffering issues for viewers streaming popular series during peak hours. The incident went undetected for 45 minutes because the existing monitoring system wasn't integrated with ServiceNow, and DevOps engineers had to manually search through documentation to find remediation procedures. This resulted in viewer complaints, trending social media criticism, and potential subscriber churn.

**The Business Problem:** Netflix's DevOps team needs a centralized system that automatically creates incidents when EC2 instances fail, provides AI-powered knowledge retrieval for remediation guidance, sends immediate Slack notifications, and allows engineers to trigger AWS remediation directly from ServiceNow during critical streaming incidents.

## Assignment Objectives

### Required System Architecture

```
AWS EC2 → AWS Integration Server → ServiceNow Custom Table → Flow Designer (Incident Creation + AI Search + Slack Notifications) → Manual Remediation via AWS Integration Server API
```

**System Components:**

- External monitoring detects EC2 failure
- REST API updates ServiceNow custom tables
- Flow Designer creates incidents and sends Slack notifications
- DevOps engineers trigger manual remediation via UI Action
- Remediation Helper calls AWS Integration Server API
- All attempts logged for audit trail

### Implementation Objectives

1. **Build EC2 Monitoring Infrastructure**

   - Create custom tables to track EC2 instance status and remediation attempts
   - Establish secure AWS integration for automated remediation calls
2. **Implement AI-Powered Knowledge Retrieval**

   - Configure AI Search to surface relevant remediation documentation
   - Create knowledge base articles that AI can discover during incidents
3. **Enable DevOps Team Workflow**

   - Provide one-click remediation interface for DevOps engineers
   - Create automated incident response with Slack notifications
   - Log all remediation attempts for audit and analysis
4. **Test and Validate the Working System**

   - Demonstrate successful EC2 remediation workflow
   - Verify AI knowledge retrieval functionality
   - Confirm incident creation and Slack notification delivery

## Critical Configuration Requirements

### Application Setup

**Create a scoped application with the exact name:** `EC2 Monitoring and Remediation`

This precise naming is required for AWS integration compatibility and must match Netflix's internal system specifications.

### AWS Integration Configuration

The following naming conventions are **mandatory** for the remediation system to function:

**Connection & Credential Alias:**

- **Name:** `AWS Integration Server C C Alias`
- **Must be created within your scoped application**

**HTTP Connection:**

- **Name:** `AWS Integration Server Connection`
- **Host:** `codon-staging.emaginelc.com`
- **Base path:** `/api/v1/queue/start`
- **Use the URL builder to construct the connection properly**

**Basic Auth Credentials:**

- **Name:** `AWS Integration Server Credentials`
- **Username:** `admin`
- **Password:** (will be provided via Slack DM)

### Table Structure Requirements

**EC2 Instance Table:** Create with table name `EC2 Instance` in your scoped application.

Required fields (note that some fields are automatically created by ServiceNow, others must be manually added):

- Instance name (String, 40 characters)
- Instance ID (String, 40 characters)
- Instance status (String, 40 characters)
- Created (Date/Time) - auto-created
- Created by (String, 40 characters) - auto-created
- Updated (Date/Time) - auto-created
- Updated by (String, 40 characters) - auto-created
- Updates (Integer) - auto-created

**Remediation Log Table:** Create with table name `Remediation Log` in your scoped application.

Required fields:

- EC2 Instance (Reference to EC2 Instance table)
- Attempted Status (String, 40 characters)
- Success (True/False)
- Timestamp (Date/Time)
- Request Payload (String, 4000 characters)
- Response Payload (String, 4000 characters)
- Response Time (Integer)
- HTTP Status Code (Integer)
- Error Message (String, 4000 characters)
- Created (Date/Time) - auto-created
- Created by (String, 40 characters) - auto-created
- Updated (Date/Time) - auto-created
- Updated by (String, 40 characters) - auto-created
- Updates (Integer) - auto-created

## Implementation Requirements

### UI Action and Script Include

Use the provided code files from the GitHub repository:

- `trigger_EC2_Remediation.js` for the UI Action
- `EC2RemediationHelper.js` for the Script Include

**UI Action Configuration:**

- **Name:** `Trigger EC2 Remediation`
- **Table:** EC2 Instance (your scoped table)
- **Action name:** `trigger_EC2_remediation`
- **Form button:** Checked
- **Active:** Checked
- **Show update:** Checked
- **Client:** Checked
- **List v2 Compatible:** Checked

**Script Include Configuration:**

- **Name:** `EC2RemediationHelper`
- **API Name:** `x_snc_ec2_monito_0.EC2RemediationHelper` (auto-generated in scope)
- **Accessible from:** This application scope only
- **Glide AJAX enabled:** Checked
- **Active:** Checked

Both components must be created within your scoped application.

### Flow Designer Workflow

Create a Flow Designer workflow within your scoped application that:

- Triggers when EC2 instance status indicates failure
- Uses the provided AI Search Custom action script
- Creates incident records for failed instances
- Sends Slack notifications using webhook (URL provided via Slack DM)

**Important:** Use Flow Designer's "Force Save" option to ensure all workflow components are included in your update set.

### AI Search Integration

Research and configure AI Search using the ServiceNow documentation: https://www.servicenow.com/docs/bundle/yokohama-platform-administration/page/administer/ai-search/concept/configuring-ais.html

Your AI Search action must be able to discover and retrieve relevant EC2 remediation knowledge articles during workflow execution.

### Knowledge Base Content

Create at least one knowledge base article containing EC2 remediation guidance. Include these keywords to ensure AI Search discoverability:

- EC2, server, instance, restart, AWS, virtual machine, cloud server, EC2 server, reboot

## Testing and Validation

### DevOps User Testing

1. Create test EC2 instance records with failure status
2. Use the "Trigger EC2 Remediation" button to demonstrate the remediation workflow
3. Verify entries are created in the Remediation Log table when DevOps engineers click the remediation button

### System Verification

**AI Search Execution Logs:** Verify AI Search functionality by checking System Logs:

- Navigate to: System Logs > System Log > All
- Filter: All > Created on Today > Level >= Information > Message starts with "AI Search"
- Confirm your workflow successfully retrieved knowledge articles

**Flow Execution:** Ensure your Flow Designer workflow creates incident records when triggered by EC2 failures.

**Slack Integration:** Confirm Slack notifications are delivered to the DevOps channel using your assigned webhook URL.

### Access Control Discovery

Navigate to: System Security > Access Control (ACL)
Filter by: Type = "record" and Name = your custom table names
Include relevant ACL records in your update set to ensure proper security configuration.

## Deliverables

### Update Set Requirements

Your update set must contain these working components:

**Core System Components:**

- UI Action: "Trigger EC2 Remediation"
- Script Include: `EC2RemediationHelper`
- Custom Tables: EC2 Instance and Remediation Log
- Connection & Credential Alias: `AWS Integration Server C C Alias`
- HTTP Connection: `AWS Integration Server Connection`
- Basic Auth Credentials: `AWS Integration Server Credentials`
- Flow Designer Workflow (all components via force save)
- Knowledge Base Article(s) with EC2 keywords
- Relevant ACL records for custom tables

**Evidence of Working System:**

- Test EC2 Instance Records showing sample data
- Test Remediation Log Entries created by clicking the remediation button
- Test Incident Record created by the flow when triggered
- System Log Records showing successful AI Search execution

**File name:** `ec2-remediation-system.xml`

### GitHub Repository Structure

Name your repo ``netflix-ec2-remediation-system``
Name your diagram ``Diagram.png``

Name your update set xml file ``ec2-remediation-system.xml``

```
/netflix-ec2-remediation-system
├── README.md
├── ec2-remediation-system.xml
├── Diagram.png
```

### README.md Content Requirements

- **System Overview:** Description of the EC2 remediation system for DevOps teams
- **Implementation Summary:** Key configuration decisions and integration points
- **Architecture Diagram:** Visual representation of the complete workflow
- **Testing Results:** Evidence that all components work together successfully
- **DevOps Usage:** Instructions for Netflix DevOps engineers on using the remediation system

### Architecture Diagram Requirements

Create a system flow diagram showing:

- EC2 failure detection and ServiceNow integration
- AI Search knowledge retrieval process
- DevOps remediation workflow with Slack notifications
- Incident creation and logging workflow

Use Draw.io and save as `architecture-diagram.png`

## Submission Requirements

1. Test your complete system thoroughly with the DevOps team workflow in mind
2. Create your update set with all required components and evidence records
3. Upload your GitHub repository with complete documentation
4. Submit your repository URL

**Critical Success Factors:**

- All component naming must match the specifications exactly
- The remediation button must successfully create log entries
- AI Search must retrieve knowledge articles (verified in system logs)
- Flow Designer must create incidents and send Slack notifications
- System must be ready for Netflix DevOps team to use during streaming incidents
