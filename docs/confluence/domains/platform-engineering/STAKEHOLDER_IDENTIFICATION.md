# Platform Decision Stakeholders

**Domain**: Platform Engineering  
**Last Updated**: 2025-01-15

---

## Stakeholder Map

### Primary Decision Authority

#### Atlas (DevOps Engineer) - Platform Engineering Lead
**Role**: Primary Decision Maker  
**Authority Level**: Autonomous for Level 1, Collaborative for Level 2-3

**Responsibilities**:
- ✅ **Kicks off** platform decisions
- ✅ **Creates criteria list** for platform decisions
- ✅ **Makes final decision** for Level 1 decisions
- ✅ **Leads** Spike and POC phases
- ✅ **Documents** all platform decisions
- ✅ **Implements** approved decisions

**Decision Scope**:
- Infrastructure architecture
- Deployment strategies
- CI/CD configuration
- Cloud provider selection
- Cost optimization (< $50/month)
- Environment management
- Docker/container decisions

---

### Collaborative Stakeholders

#### Ledger (Financial Accountant) - Money Domain Lead
**Role**: Financial Approver & Cost Consultant  
**Authority Level**: Approval required for cost decisions > $50/month

**Responsibilities**:
- ✅ **Creates cost criteria** for financial decisions
- ✅ **Reviews** cost analysis in decisions
- ✅ **Approves/Rejects** cost decisions > $50/month
- ✅ **Provides** budget constraints
- ✅ **Monitors** infrastructure costs

**Consultation Triggers**:
- Any decision with cost impact > $50/month
- Infrastructure scaling decisions
- New paid service adoption
- Cost optimization opportunities

**Decision Input**:
- Budget availability
- Cost-benefit analysis
- ROI requirements
- Cost optimization priorities

---

#### Guardian (Security Analyst) - Security Domain Lead
**Role**: Security Consultant & Approver  
**Authority Level**: Approval required for security-impacting decisions

**Responsibilities**:
- ✅ **Creates security criteria** for security decisions
- ✅ **Reviews** security implications
- ✅ **Approves/Rejects** security infrastructure decisions
- ✅ **Provides** security requirements
- ✅ **Validates** security compliance

**Consultation Triggers**:
- Security infrastructure changes
- Network/firewall decisions
- Secrets management changes
- Compliance requirements
- Security scanning/tooling decisions

**Decision Input**:
- Security requirements
- Compliance needs
- Risk assessment
- Security best practices

---

#### Catalyst (Product Owner) - Product Domain Lead
**Role**: Product Requirements Provider  
**Authority Level**: Consultation for feature-driven infrastructure

**Responsibilities**:
- ✅ **Kicks off** feature-driven infrastructure needs
- ✅ **Provides** feature requirements
- ✅ **Defines** performance requirements
- ✅ **Sets** deployment timelines
- ✅ **Prioritizes** infrastructure needs

**Consultation Triggers**:
- New feature requiring infrastructure
- Performance requirements
- Deployment timeline needs
- User-facing infrastructure changes

**Decision Input**:
- Feature requirements
- Performance targets
- Timeline constraints
- User impact considerations

---

### Advisory Stakeholders

#### Architect (Principal Engineer) - Technical Architecture
**Role**: Technical Advisor  
**Authority Level**: Consultation for architecture decisions

**Responsibilities**:
- ⚠️ **Reviews** technical architecture decisions
- ⚠️ **Provides** technical guidance
- ⚠️ **Validates** scalability considerations
- ⚠️ **Reviews** technology choices

**Consultation Triggers**:
- Major architecture changes
- Technology stack decisions
- Scalability concerns
- Technical debt implications

**Decision Input**:
- Technical feasibility
- Architecture patterns
- Scalability considerations
- Technology tradeoffs

---

### Informed Stakeholders

#### All Domain Leads
**Role**: Information Recipients  
**Authority Level**: Informed of decisions affecting their domains

**Responsibilities**:
- 📢 **Receive** decision notifications
- 📢 **Review** decisions affecting their domain
- 📢 **Provide** feedback if concerns arise

**Notification Triggers**:
- Infrastructure changes affecting their domain
- Deployment changes
- Environment changes
- Cost changes

---

## Decision Process by Stakeholder

### Who Kicks Off Decisions?

| Decision Type | Kicked Off By | Process |
|--------------|---------------|---------|
| **Infrastructure Need** | Atlas | Identifies need → Spike → POC → Decision |
| **Feature-Driven Infrastructure** | Catalyst | Requests infrastructure → Atlas evaluates → Decision |
| **Security Infrastructure** | Guardian | Requests security infrastructure → Atlas + Guardian collaborate → Decision |
| **Cost Optimization** | Atlas or Ledger | Identifies opportunity → Atlas evaluates → Ledger approves if > $50/month |
| **Performance Issue** | Any Domain Lead | Reports issue → Atlas investigates → Decision |

### Who Creates Criteria Lists?

| Criteria Type | Created By | Reviewed By |
|--------------|------------|-------------|
| **Platform Criteria** | Atlas | Atlas (autonomous) |
| **Cost Criteria** | Ledger | Atlas + Ledger |
| **Security Criteria** | Guardian | Atlas + Guardian |
| **Performance Criteria** | Catalyst | Atlas + Catalyst |
| **Technical Criteria** | Architect | Atlas + Architect |

### Decision Approval Matrix

| Decision Level | Atlas | Ledger | Guardian | Catalyst | Architect |
|----------------|-------|--------|----------|----------|-----------|
| **Level 1: Autonomous** | ✅ Approve | 📢 Inform | 📢 Inform | 📢 Inform | - |
| **Level 2: Collaborative (Cost)** | ✅ Lead | ✅ Approve | ⚠️ Consult | ⚠️ Consult | ⚠️ Consult |
| **Level 2: Collaborative (Security)** | ✅ Lead | 📢 Inform | ✅ Approve | 📢 Inform | ⚠️ Consult |
| **Level 2: Collaborative (Feature)** | ✅ Lead | ⚠️ Consult | ⚠️ Consult | ✅ Approve | ⚠️ Consult |
| **Level 3: Strategic** | ✅ Lead | ✅ Approve | ✅ Approve | ✅ Approve | ✅ Approve |

**Legend**:
- ✅ **Approve**: Must approve decision
- ⚠️ **Consult**: Must be consulted, input considered
- 📢 **Inform**: Informed of decision, can provide feedback

---

## Communication Matrix

### Who Needs to Know What?

| Decision Type | Atlas | Ledger | Guardian | Catalyst | Architect | Domain Leads |
|---------------|-------|--------|----------|----------|------------|--------------|
| **Infrastructure Change** | ✅ | 📢 | ⚠️ | 📢 | ⚠️ | 📢 |
| **Cost Decision** | ✅ | ✅ | 📢 | 📢 | - | 📢 |
| **Security Decision** | ✅ | 📢 | ✅ | 📢 | ⚠️ | 📢 |
| **Feature Infrastructure** | ✅ | ⚠️ | ⚠️ | ✅ | ⚠️ | 📢 |
| **Strategic Decision** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Legend**:
- ✅ **Must Know**: Directly involved
- ⚠️ **Should Know**: Consulted or impacted
- 📢 **Informed**: Notification sent

---

## Quick Reference: Who Does What?

### Kicking Off Decisions
- **Atlas**: Infrastructure needs, optimizations
- **Catalyst**: Feature-driven infrastructure
- **Guardian**: Security infrastructure
- **Ledger**: Cost optimizations

### Creating Criteria
- **Atlas**: Platform criteria (autonomous)
- **Ledger**: Cost criteria
- **Guardian**: Security criteria
- **Catalyst**: Performance criteria
- **Architect**: Technical criteria

### Approving Decisions
- **Atlas**: All Level 1, leads Level 2-3
- **Ledger**: Cost decisions > $50/month
- **Guardian**: Security-impacting decisions
- **Catalyst**: Feature infrastructure decisions
- **All**: Strategic (Level 3) decisions

---

**Maintained By**: Atlas (DevOps Engineer)  
**Review Cycle**: Quarterly


