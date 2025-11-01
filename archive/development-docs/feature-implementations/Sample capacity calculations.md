Columns D-Y

| Role | [Work Effort](https://docs.google.com/spreadsheets/d/1i4XWpHy-OW2Zt8YURN9ir2q6Qb0O6p_9S1-NYKmDklA/edit?usp=sharing) | Expander \>15 hrs | Work Type | EHR/s Impacted | Status | Phase | System Projected Go-Live Date | Sponsor | Service Line | Assignment Date | Comments/Details | Role Multiplier | Work Type Weight | Phase Weight | Base Hrs/Wk | Active Hrs/Wk | Active | Missing Data |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | ----- | :---- | :---- | :---- | :---- | :---: | :---: | :---: | :---: | :---: | :---: | :---- |
| Secondary | S \- 1-2 hrs/wk |  | System Initiative | All | In Progress | Design |  | Gail Moxley | Care Coordination |  |  | 0.5 | 1 | 1 | 1.5 | 0.75 | Yes | ✓ Complete |

**Role multiplier**  
\=IFS(  
  D2="Owner", 1,  
  D2="Co-owner", 1,  
  D2="Secondary", 0.5,  
  D2="Support", 0.25,  
  TRUE, 0  
)

**Work Type Weight**  
\=IFS(  
  G2="Epic Gold", 1,  
  G2="Governance", 0.7,  
  G2="System Initiative", 1,  
  G2="System Project", 1,  
  G2="Epic Upgrades", 1,  
  G2="General Support", 1,  
  G2="Policy/Guidelines", 0.5,  
  G2="Market Project", 0.5,  
  G2="Ticket", 1,  
  TRUE, 0  
)

**Phase Weight**  
\=IF(J2="N/A", 1,  
   IF(G2="Governance", 1,  
      IFS(  
        J2="Discovery/Define", 0.3,  
        J2="Design", 1,  
        J2="Build", 1,  
        J2="Validate/Test", 1,  
        J2="Deploy", 1,  
        J2="Did we Deliver", 0.25,  
        J2="Post Go Live Support", 0.5,  
        J2="Maintenance", 0.25,  
        J2="Steady State", 0.15,  
        TRUE, 0  
      )  
   )  
)  
**Base Work Hours**  
\=IFS(  
  E2="", 0,  
  LEFT(E2,2)="XS", 0.5,  
  LEFT(E2,2)="XL", 15,  
  LEFT(E2,1)="S", 1.5,  
  LEFT(E2,1)="M", 3.5,  
  LEFT(E2,1)="L", 7.5,  
  E2="Unspecified", 1,  
  TRUE, 0  
)

**Active Work Hours**  
\=IF(X2="Yes", (V2\*S2\*T2\*U2) \+ IF(ISNUMBER(F2), F2, 0), 0\)

Active  
\=IF(OR(I2="Active",I2="In Progress",I2="Build",I2="Test"),"Yes","No")

**Missing**  
\=IF(B2="", "N/A",  
   IF(AND(D2="", E2="", G2=""), "Needs Baseline Information",  
      IF(D2="", "⚠️ Missing Role",  
         IF(E2="", "⚠️ Missing Size",  
            IF(G2="", "⚠️ Missing Work Type",  
               IF(J2="", "⚠️ Missing Phase", "✓ Complete"))))))  
