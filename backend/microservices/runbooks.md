# Operational Runbooks for Microservices

## Monitoring and Alerting

### Service Health Checks

**Recurring Task Service**:
- Health endpoint: `/health`
- Expected response: `{"status": "healthy", ...}`
- Alert if status is not "healthy" for more than 5 minutes

**Notification Service**:
- Health endpoint: `/health`
- Expected response: `{"status": "healthy", ...}`
- Alert if status is not "healthy" for more than 5 minutes

### Key Metrics to Monitor

1. **Event Processing Rate**
   - Measure: Events processed per minute
   - Alert threshold: Drop below 50% of expected rate
   - Action: Check for service outages or connectivity issues

2. **Event Processing Latency**
   - Measure: Time from event receipt to processing completion
   - Alert threshold: Average latency > 30 seconds
   - Action: Check for database or Dapr connectivity issues

3. **Failed Event Count**
   - Measure: Number of events that failed processing
   - Alert threshold: More than 5 failures in 5 minutes
   - Action: Check error logs and service health

4. **Database Connection Pool Usage**
   - Measure: Percentage of connections in use
   - Alert threshold: > 80% utilization
   - Action: Increase pool size or investigate query performance

5. **Memory Usage**
   - Measure: Memory consumption per service
   - Alert threshold: > 80% of allocated memory
   - Action: Restart service or investigate memory leak

### Log Monitoring

**Critical Log Patterns to Alert On**:
- `"Error handling task-completed event"`
- `"Failed to publish event"`
- `"Database connection failed"`
- `"Circuit breaker is OPEN"`
- `"Out of memory"`

## Troubleshooting

### Common Issues and Solutions

#### Issue: Services Not Processing Events
**Symptoms**: No new recurring tasks being created, no notifications being sent

**Diagnosis Steps**:
1. Check service health endpoints
2. Verify Dapr sidecar is running and connected
3. Check Dapr pub/sub connectivity
4. Review service logs for error messages
5. Verify database connectivity

**Resolution**:
1. Restart the affected service
2. Verify Dapr components are configured correctly
3. Check that event topics exist and are accessible
4. Ensure database connection string is valid

#### Issue: Duplicate Task Creation
**Symptoms**: Same recurring task is being created multiple times

**Diagnosis Steps**:
1. Check the `ProcessedEvents` store for duplicate entries
2. Verify idempotency logic is working
3. Check if multiple instances of the service are running

**Resolution**:
1. Implement proper idempotency checks
2. Ensure only one instance of each service runs at a time
3. Review and fix any race conditions

#### Issue: High Memory Usage
**Symptoms**: Service consuming excessive memory, potential crashes

**Diagnosis Steps**:
1. Monitor memory usage trends
2. Check for memory leaks in application logs
3. Verify proper resource cleanup in code

**Resolution**:
1. Restart the service to clear memory
2. Review code for proper resource disposal
3. Adjust garbage collection settings if needed

#### Issue: Database Connection Issues
**Symptoms**: Slow processing, connection timeouts, errors in logs

**Diagnosis Steps**:
1. Check database connectivity
2. Review connection pool configuration
3. Look for database lock issues
4. Check for long-running queries

**Resolution**:
1. Increase database connection pool size
2. Optimize slow queries
3. Check database server resources
4. Implement connection retry logic

### Emergency Procedures

#### Service Recovery
1. **Immediate Response**:
   - Check service health and logs
   - Identify the scope of impact
   - Communicate with stakeholders

2. **Recovery Steps**:
   - Restart the affected service
   - Verify connectivity to dependencies
   - Monitor for successful recovery
   - Document the incident

#### Data Corruption
1. **Immediate Response**:
   - Stop the affected service to prevent further corruption
   - Isolate the affected data
   - Assess the extent of corruption

2. **Recovery Steps**:
   - Restore from backup if necessary
   - Implement data validation checks
   - Re-process any missed events
   - Verify data integrity

## Maintenance Procedures

### Regular Maintenance Tasks

#### Daily Tasks
- Review service logs for errors
- Check health status of all services
- Verify event processing rates are normal

#### Weekly Tasks
- Review performance metrics
- Check disk space usage for logs
- Update service configurations if needed
- Review and rotate certificates if applicable

#### Monthly Tasks
- Review and update runbooks
- Conduct disaster recovery drill
- Update service versions and dependencies
- Review and optimize database performance

### Deployment Procedures

#### Pre-deployment Checks
1. Verify test environments are working
2. Backup current production configuration
3. Coordinate with team for deployment window
4. Prepare rollback plan

#### Deployment Steps
1. Deploy to staging environment first
2. Run integration tests
3. Deploy to production during low-traffic window
4. Monitor services after deployment
5. Verify all functionality works as expected

#### Post-deployment Verification
1. Check service health endpoints
2. Monitor event processing rates
3. Verify no errors in logs
4. Confirm user functionality works

## Incident Response

### Severity Levels

**Level 1 (Critical)**: Service completely down, affecting all users
- Response time: Immediate (within 15 minutes)
- On-call escalation: Manager notified

**Level 2 (High)**: Service degraded, affecting some functionality
- Response time: Within 1 hour
- On-call escalation: Team lead notified

**Level 3 (Medium)**: Minor issues, not affecting core functionality
- Response time: Within 4 hours
- On-call escalation: Team member notified

**Level 4 (Low)**: Minor issues, no immediate action required
- Response time: Within 24 hours
- On-call escalation: Scheduled for next business day

### Escalation Process

1. **Level 4**: Assigned to on-call engineer
2. **Level 3**: Escalated to senior engineer after 2 hours
3. **Level 2**: Escalated to team lead after 1 hour
4. **Level 1**: Escalated to manager immediately

## Contact Information

### On-Call Engineers
- Primary: [Contact Info]
- Secondary: [Contact Info]

### Management
- Team Lead: [Contact Info]
- Manager: [Contact Info]

### External Dependencies
- Database Admin: [Contact Info]
- Infrastructure Team: [Contact Info]
- Security Team: [Contact Info]

## Appendix

### Command Reference

**Check Service Status**:
```bash
curl http://localhost:<port>/health
```

**Restart Service**:
```bash
dapr stop --app-id <service-name>
dapr run --app-id <service-name> -- python <service-file>.py
```

**View Logs**:
```bash
dapr logs <service-name>
```

**Check Dapr Status**:
```bash
dapr status -k
```

### Quick Fixes

**Service Not Responding**:
1. Check if Dapr sidecar is running
2. Restart the service
3. Check database connectivity

**Event Processing Backlog**:
1. Check if service is healthy
2. Monitor resource usage
3. Consider scaling up temporarily
4. Check for any blocking operations