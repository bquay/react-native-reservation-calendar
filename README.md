# react-native-reservation-calendar

## Summary
After reading through the challenge and making sure I understood the requirements, I searched for similar libraries or packages that might have some of the functionality I would need if this were a long-term project.

I found several libraries and did some analysis to decide that react-native-week-view (the repo I forked from) was the most suitable for this interview given the time constraints.

I made several modifications to conform the existing library to the given Cove Reservation data structure while keeping it generalized for further development.

I am very pleased with my decision to go with this library as a base for the project as it is very straightforward to modify. During my initial assesment I thought this might not be good for long-term use but, I think given what I know now it very well could be.

## Instructions
To run this project
1. CD into the repo and "yarn"
2. CD into /exmaple and "yarn"
3. CD into /ios and "pod install"
4. CD back into /example
-  To run on iOS - "yarn ios"
-  To run on Android - "yarn android"

## TODO
- [x] Convert 12hr time to 24hr time
- [x] Confirm working with reservation data structure
- [x] Auto select reservation colors
- [x] Async get data from API
- [x] Add CRUD functions
- [x] Cleanup code 
- [ ] Handle reservation conflicts
- [ ] Add Redux + Sagas structure*
- [ ] Add Tests*
