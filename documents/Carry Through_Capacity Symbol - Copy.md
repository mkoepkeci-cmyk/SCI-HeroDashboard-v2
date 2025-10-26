

| Name | Total | Active Assignments | Active Hrs/Wk | Available Hours | Capacity Utilization | Capacity |
| :---- | ----- | ----- | ----- | ----- | ----- | :---- |
| Ashley | 16 | 11 | 11.76 | 40 | 29.41% | ⚠️ 4 Incomplete \- 🟢 Under |
| Brooke | 14 | 11 | 25.28 | 40 | 63.19% | ⚠️ 5 Incomplete \- 🟡 Near |
| Dawn | 22 | 20 | 12.84 | 40 | 32.11% | ⚠️ 2 Need Baseline Info, 4 Other Incomplete \- 🟢 Under |
| Jason | 23 | 20 | 16.02 | 40 | 40.05% | 🟢 Under Capacity |
| Josh | 95 | 44 | 44.50 | 40 | 111.25% | ⚠️ 22 Need Baseline Info, 40 Other Incomplete \- 🔴 Over |
| Kim | 13 | 11 | 3.75 | 40 | 9.38% | ⚠️ 10 Incomplete \- 🟢 Under |
| Lisa | 27 | 18 | 2.14 | 40 | 5.34% | ⚠️ 16 Incomplete \- 🟢 Under |
| Marty | 43 | 37 | 39.96 | 40 | 99.91% | 🔴 Over Capacity |
| Matt | 23 | 16 | 14.13 | 40 | 35.31% | ⚠️ 12 Need Baseline Info \- 🟢 Under |
| Melissa | 10 | 10 | 4.71 | 40 | 11.78% | 🟢 Under Capacity |
| Robin | 21 | 17 | 1.48 | 40 | 3.70% | ⚠️ 7 Incomplete \- 🟢 Under |
| Sherry | 23 | 17 | 4.94 | 40 | 12.34% | ⚠️ 7 Incomplete \- 🟢 Under |
| Trudy | 25 | 13 | 10.16 | 40 | 25.39% | ⚠️ 10 Incomplete \- 🟢 Under |
| Van | 31 | 12 | 18.62 | 40 | 46.55% | ⚠️ 1 Incomplete \- 🟢 Under |
| Yvette | 20 | 18 | 9.73 | 40 | 24.31% | ⚠️ 14 Incomplete \- 🟢 Under |

**Total**  
\=COUNTIF(Ashley\!A2:A982,"\<\>")

Active Assignments  
\=COUNTIF(Ashley\!X2:X982,"Yes")

Active Hrs/Wk  
\=SUMIF(Ashley\!X2:X982,"Yes",Ashley\!W2:W982)

Hrs/Wk  
\=40

Capacity Utilization  
\=IFERROR(D2/E2,0)

**Determining Capacity**  
\=LET(incomplete, COUNTIF(Ashley\!Y:Y,"⚠️\*"), baseline, COUNTIF(Ashley\!Y:Y,"Needs Baseline Information"), capacity, VALUE(SUBSTITUTE(F2,"%",""))/100, IF(OR(incomplete\>0, baseline\>0), IF(baseline\>0, "⚠️ " & baseline & " Need Baseline Info" & IF(incomplete\>0, ", " & incomplete & " Other Incomplete", "") & " \- ", "⚠️ " & incomplete & " Incomplete \- ") & IF(capacity\>0.85,"🔴 Over", IF(capacity\>=0.75,"🟠 At", IF(capacity\>=0.6,"🟡 Near","🟢 Under"))), IF(capacity\>0.85,"🔴 Over Capacity", IF(capacity\>=0.75,"🟠 At Capacity", IF(capacity\>=0.6,"🟡 Near Capacity","🟢 Under Capacity")))))