import { StrictMode, useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

import { Loading, Popup } from "../components/Loading";

import "../assets/main.css";
import "./TimeTable.css";
import "./TimeTableDropdowns.css";

import { fetchAllDepartments, fetchDepartmentCurriculumsData } from "../js/departments"
import { deserializeSchedule, fetchClassJsonSchedule, fetchSubjectTimeSlotMoveAvailability, fetchSubjectTimeSlotMove, fetchSerializedClassSchedule, generateSchedule, getValidateSchedules, deleteClearDepartmentSchedule, deleteClearSectionSchedule, getSchedGenStatus } from "../js/schedule"

import { generateTimeSlotRowLabels } from "../js/week-time-table-grid-functions";
import { MainHeader } from "../components/Header";
import { Box, Button, Typography } from "@mui/material";

const SECTION_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

function TimeTable() {

    /////////////////////////////////////////////////////////////////////////////////
    //                     LOAD GUARD COMPONENT STATES
    /////////////////////////////////////////////////////////////////////////////////

    const [schedGenStatus, setSchedGenStatus] = useState(null)
    const [IsLoading, setIsLoading] = useState(false);
    const [popupOptions, setPopupOptions] = useState(null);

    /////////////////////////////////////////////////////////////////////////////////
    //                       TIME TABLE GRID STATES
    /////////////////////////////////////////////////////////////////////////////////

    const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [startHour, setStartHour] = useState(7);
    const [timeSlotMinuteInterval, setTimeSlotMinuteInterval] = useState(30);
    const [dailyTimeSlots, setDailyTimeSlots] = useState(24);

    /////////////////////////////////////////////////////////////////////////////////
    //                       STATES FOR FETCHED DATA
    /////////////////////////////////////////////////////////////////////////////////

    const [allDepartments, setAllDepartment] = useState([]);                // fetch on page load
    const [departmentCurriculumsData, setDepartmentCurriculumsData] = useState([]);              // fetch on semester selection
    const [classAssignedSubjects, setClassAssignedSubjects] = useState([]) // fetch on section selection

    const [pickedUpSubject, setPickedUpSubject] = useState(null);
    const [pickedUpColor, setPickedUpColor] = useState(null);

    /////////////////////////////////////////////////////////////////////////////////
    //                       DROPDOWN SELECTION STATES
    /////////////////////////////////////////////////////////////////////////////////

    const [departmentID, setDepartmentID] = useState("");
    const [semesterIndex, setSemesterIndex] = useState("");
    const [curriculumIndex, setCurriculumIndex] = useState("");
    const [yearLevelIndex, setYearLevelIndex] = useState("");
    const [sectionIndex, setSectionIndex] = useState("");

    /////////////////////////////////////////////////////////////////////////////////
    //                       PAGE LOAD PROCESS
    /////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {

        // TODO: fetch basic const values (data below is just temporary);

        const starting_hour = 7;
        const time_slot_per_hour = 2;
        const daily_time_slots = 24;

        const time_slot_minute_interval = 60 / time_slot_per_hour;

        setStartHour(starting_hour);
        setTimeSlotMinuteInterval(time_slot_minute_interval);
        setDailyTimeSlots(daily_time_slots);

        useEffectAsyncs();
    }, []);

    async function useEffectAsyncs() {
        try {
            setIsLoading(true);

            const all_departments = await fetchAllDepartments();

            setAllDepartment(all_departments);
            console.log('fetched departments: ', all_departments);

            setIsLoading(false);
        } catch (err) {
            setPopupOptions({
                Heading: "Failed to Fetch All Department Data",
                HeadingStyle: { background: "red", color: "white" },
                Message: `${err}`
            });
            setIsLoading(false);
            setSemesterIndex("");
        }
    }

    /////////////////////////////////////////////////////////////////////////////////
    //                       DROPDOWN HANDLERS
    /////////////////////////////////////////////////////////////////////////////////

    const handleDepartmentChange = async (event) => {
        console.log(`selected departmentID: ${event.target.value}`);
        setDepartmentID(event.target.value);
        setSemesterIndex("");
        setCurriculumIndex("");
        setYearLevelIndex("");
        setSectionIndex("");
        setClassAssignedSubjects([]);
        setPickedUpSubject(null);
        setAvailableSubjectTimeSlotMove(null)
        setSchedGenStatus(null);

        // clear any old polling loop
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }

    const updateCurriculumData = async (semester) => {
        const department_curriculums_data = await fetchDepartmentCurriculumsData(departmentID, semester);
        setDepartmentCurriculumsData(department_curriculums_data);
    }

    const handleSemesterChange = async (event) => {
        console.log(`selected semesterIndex: ${event.target.value}`);
        setSemesterIndex(event.target.value);
        setCurriculumIndex("");
        setYearLevelIndex("");
        setSectionIndex("");
        setClassAssignedSubjects([]);
        setPickedUpSubject(null);
        setAvailableSubjectTimeSlotMove(null)

        // clear any old polling loop
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (event.target.value) {
            setIsLoading(true);

            try {
                await updateCurriculumData(event.target.value);

                const sched_gen_status = await getSchedGenStatus(event.target.value, departmentID);
                setSchedGenStatus(sched_gen_status);

                setIsLoading(false);
            } catch (err) {
                setPopupOptions({
                    Heading: "Failed to Fetch Semester Data",
                    HeadingStyle: { background: "red", color: "white" },
                    Message: `${err}`
                });
                setIsLoading(false);
                setSemesterIndex("");
            }
        }
    };

    const handleCurriculumChange = (event) => {
        console.log(`selected curriculumIndex: ${event.target.value}`);
        setCurriculumIndex(event.target.value);
        setYearLevelIndex("");
        setSectionIndex("");
        setClassAssignedSubjects([]);
        setPickedUpSubject(null);
        setAvailableSubjectTimeSlotMove(null)

        // clear any old polling loop
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const handleYearLevelChange = (event) => {
        console.log(`selected yearLevelIndex: ${event.target.value}`);
        setYearLevelIndex(event.target.value);
        setSectionIndex("");
        setClassAssignedSubjects([]);
        setPickedUpSubject(null);
        setAvailableSubjectTimeSlotMove(null)

        // clear any old polling loop
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const intervalRef = useRef(null);

    const handleSectionChange = async (event) => {
        const newSection = event.target.value;
        setSectionIndex(newSection);
        setPickedUpSubject(null);
        setAvailableSubjectTimeSlotMove(null)

        // clear any old polling loop
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (!newSection) return;

        // fetch initial status & load once
        const initialStatus = await getSchedGenStatus(semesterIndex, departmentID);
        setSchedGenStatus(initialStatus);
        await load_schedule(newSection);

        // if it’s still "in progress" or "queued" start up a new loop
        if (["in progress", "on queue"].includes(initialStatus.Status)) {
            intervalRef.current = window.setInterval(async () => {
                const currentStatus = await getSchedGenStatus(semesterIndex, departmentID);
                setSchedGenStatus(currentStatus);

                if (["in progress", "on queue"].includes(currentStatus.Status)) {
                    await load_schedule(newSection);
                } else {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                }
            }, 1_357);
        }
    };

    // make sure we also clear when the component unmounts
    useEffect(() => () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }, []);

    const load_schedule = async (sectionIndex) => {
        try {
            // Fetch the latest schedule data
            const classScheduledSubjects = await fetchClassJsonSchedule(
                departmentID,
                semesterIndex,
                departmentCurriculumsData[curriculumIndex].CurriculumID,
                yearLevelIndex,
                sectionIndex
            );

            // Update state to trigger re-render with new data
            setClassAssignedSubjects(classScheduledSubjects);
            console.log('fetched subjects: ', classScheduledSubjects)

            // Assign colors to subjects for display
            const subjectColors = {};
            let subjectCount = 0;

            classScheduledSubjects.forEach((subject) => {
                if (!subjectColors[subject.SubjectCode]) {
                    subjectCount++;
                    subjectColors[subject.SubjectCode] = `color-${subjectCount}`;
                }
            });

            setSubjectColors(subjectColors);

            // Scroll to the bottom of the page
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth',
            });
        } catch (err) {
            console.error("Error loading schedule:", err);
            setPopupOptions({
                Heading: "Failed to Load Schedule",
                HeadingStyle: { background: "red", color: "white" },
                Message: `${err}`,
            });
        }
    };

    const handleClearDepartmentSchedule = async () => {
        setIsLoading(true)

        try {
            const msg = await deleteClearDepartmentSchedule(departmentID, semesterIndex)

            setClassAssignedSubjects([]);
            setPickedUpSubject(null);
            setAvailableSubjectTimeSlotMove(null)

            setPopupOptions({
                Heading: "Cleared Department Schedule",
                HeadingStyle: { background: "green", color: "white" },
                Message: msg
            });

        } catch (err) {
            setPopupOptions({
                Heading: "Clear Department Schedule Failed",
                HeadingStyle: { background: "red", color: "white" },
                Message: `${err}`
            });
        }

        setIsLoading(false)
    }

    const handleClearClassSchedule = async () => {
        setIsLoading(true)

        try {
            const msg = await deleteClearSectionSchedule(
                departmentID,
                semesterIndex,
                departmentCurriculumsData[curriculumIndex].CurriculumID,
                yearLevelIndex,
                sectionIndex
            )

            setClassAssignedSubjects([]);
            setPickedUpSubject(null);
            setAvailableSubjectTimeSlotMove(null)

            setPopupOptions({
                Heading: "Cleared Section Schedule",
                HeadingStyle: { background: "green", color: "white" },
                Message: msg
            });

        } catch (err) {
            setPopupOptions({
                Heading: "Clear Section Schedule Failed",
                HeadingStyle: { background: "red", color: "white" },
                Message: `${err}`
            });
        }

        setIsLoading(false)
    }

    /////////////////////////////////////////////////////////////////////////////////
    //                             DROPDOWN HANDLERS
    /////////////////////////////////////////////////////////////////////////////////

    const generateDepartmentSchedules = async () => {
        setIsLoading(true)

        try {
            const msg = await generateSchedule(semesterIndex, departmentID)
            const res = await getSchedGenStatus(semesterIndex, departmentID)

            setSectionIndex("");
            setClassAssignedSubjects([]);
            setSchedGenStatus(res)

            setPopupOptions({
                Heading: "Generating Schedule...",
                HeadingStyle: { background: "Yellow", color: "black" },
                Message: msg
            });
        } catch (err) {
            setPopupOptions({
                Heading: "Failed to generate schedule for the department",
                HeadingStyle: { background: "red", color: "white" },
                Message: `${err}`
            });
        }

        setIsLoading(false)
    };

    const handleValidateSchedules = async () => {
        setIsLoading(true)

        try {
            const validation_errors = await getValidateSchedules(semesterIndex, departmentID)

            if (validation_errors.length > 0 && Array.isArray(validation_errors)) {
                setPopupOptions({
                    Heading: "Validation Problems",
                    HeadingStyle: { background: "Orange", color: "black" },
                    Message: validation_errors
                });
            } else {
                setPopupOptions({
                    Heading: "Validation Result",
                    HeadingStyle: { background: "Green", color: "white" },
                    Message: 'there are no problems found in the schedules'
                });
            }
        } catch (err) {
            setPopupOptions({
                Heading: "Validation Failed",
                HeadingStyle: { background: "red", color: "white" },
                Message: `${err}`
            });
        }

        setIsLoading(false)
    }

    const [subjectColors, setSubjectColors] = useState({});

    /////////////////////////////////////////////////////////////////////////////////
    //                              COMPONENT UI CODE
    /////////////////////////////////////////////////////////////////////////////////

    const [availableSubjectTimeSlotMove, setAvailableSubjectTimeSlotMove] = useState(null);

    const handlePickupSubject = async (picked_up_subject) => {

        try {
            const subject_move_time_slot_availability = await fetchSubjectTimeSlotMoveAvailability(
                picked_up_subject,
                departmentID,
                semesterIndex,
                departmentCurriculumsData[curriculumIndex].CurriculumID,
                yearLevelIndex,
                sectionIndex
            );

            console.log('subject_move_time_slot_availability : ', subject_move_time_slot_availability)
            setAvailableSubjectTimeSlotMove(subject_move_time_slot_availability)
        } catch (err) {
            setPopupOptions({
                Heading: "Time Slot Availability Check Unavailable",
                HeadingStyle: { background: "red", color: "white" },
                Message: `${err}`
            });

            return
        }


        let current_assigned_subjects = structuredClone(classAssignedSubjects);
        let current_picked_up_subject = structuredClone(pickedUpSubject);

        if (current_picked_up_subject) {
            current_assigned_subjects.push(current_picked_up_subject)
            current_picked_up_subject = null
        }

        current_picked_up_subject = picked_up_subject

        const new_assigned_subjects = current_assigned_subjects.filter(subj => {
            return !(picked_up_subject.DayIdx == subj.DayIdx && picked_up_subject.TimeSlotIdx == subj.TimeSlotIdx);
        })

        const heights = Array.from(
            document.querySelectorAll('table tr'),
            row => row.offsetHeight
        );

        const max_height = Math.max(...heights);
        setCellHeight(max_height * 0.875);

        console.log('max height : ', max_height)

        setClassAssignedSubjects(new_assigned_subjects);
        setPickedUpSubject(current_picked_up_subject);

        console.log('picked up subject: ', current_picked_up_subject);
        console.log('new assigned subject: ', new_assigned_subjects);
    }

    const handleCancelPickupSubject = () => {
        let new_assigned_subjects = structuredClone(classAssignedSubjects);

        if (pickedUpSubject) {
            new_assigned_subjects.push(pickedUpSubject)
            setPickedUpSubject(null);
            setAvailableSubjectTimeSlotMove(null)
        }

        setClassAssignedSubjects(new_assigned_subjects);
    }

    const handleDropPickedUpSubject = async (selected_day, selected_time_slot) => {
        if (!pickedUpSubject) {
            console.log('nothing to move')
            return;
        }

        if (!availableSubjectTimeSlotMove) {
            setPopupOptions({
                Heading: "Time Slot Move Error",
                HeadingStyle: { background: "red", color: "white" },
                Message: `time slot availability array not found`
            });
            return;
        }

        let is_movable = true;
        let total_free_time_slots = 0

        for (let i = 0; i < pickedUpSubject.SubjectTimeSlots; i++) {
            if (!availableSubjectTimeSlotMove[selected_day][selected_time_slot + i]) {
                is_movable = false;
                break;
            }

            total_free_time_slots++
        }

        if (!is_movable) {
            setPopupOptions({
                Heading: "Move Not Allowed",
                HeadingStyle: { background: "red", color: "white" },
                Message: `the subject to be move has a total of ${pickedUpSubject.SubjectTimeSlots} time slots, while the selected time slot only have ${total_free_time_slots} free time slots from the starting and preceding time slots`
            });
            return;
        }

        const movedSubject = structuredClone(pickedUpSubject)
        movedSubject.DayIdx = Number(selected_day)
        movedSubject.TimeSlotIdx = Number(selected_time_slot)

        try {
            const msg = await fetchSubjectTimeSlotMove(
                movedSubject,
                departmentID,
                semesterIndex,
                departmentCurriculumsData[curriculumIndex].CurriculumID,
                yearLevelIndex,
                sectionIndex
            );

            setPopupOptions({
                Heading: "Time Slot Move Success",
                HeadingStyle: { background: "green", color: "white" },
                Message: msg
            });

            const newClassAssignedSubject = structuredClone(classAssignedSubjects)
            newClassAssignedSubject.push(movedSubject)

            setClassAssignedSubjects(newClassAssignedSubject);
            setPickedUpSubject(null);
            setAvailableSubjectTimeSlotMove(null)
        } catch (err) {
            setPopupOptions({
                Heading: "Time Slot Move Error",
                HeadingStyle: { background: "red", color: "white" },
                Message: `${err}`
            });
            return;
        }
    }

    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (event) => {
            setPosition({ x: event.clientX, y: event.clientY });
        };

        // Listen for mousemove on the whole window
        window.addEventListener('mousemove', handleMouseMove);

        // Clean up on unmount
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const [cellHeight, setCellHeight] = useState(0);

    return (
        <>
            <MainHeader pageName={'schedule'} />
            {/*================================= Loading Component =================================*/}

            <Popup popupOptions={popupOptions} closeButtonActionHandler={() => {
                setPopupOptions(null);
            }} />

            <Loading
                IsLoading={IsLoading}
            />

            <div className="table-container">

                {/*================================= Dropdown Container =================================*/}

                <div className="dropdown-container" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div id="left-dropdown-container" style={{ width: '100%', display: 'flex', justifyContent: 'space-evenly', padding: '0.2em', gap: '0.5em' }}>
                        <select className="dropdown" style={{ width: '100%' }} value={departmentID} onChange={handleDepartmentChange} disabled={pickedUpSubject}>
                            <option value="">Department</option>
                            {allDepartments ?
                                allDepartments.map((department, index) => (
                                    <option key={index} value={department.DepartmentID}>{department.Code}</option>
                                )) : null
                            }
                        </select>

                        <select className="dropdown" style={{ width: '100%' }} value={semesterIndex} onChange={handleSemesterChange} disabled={!departmentID || pickedUpSubject}>
                            <option value="">Semester</option>
                            <option value={0}>1st Semester</option>
                            <option value={1}>2nd Semester</option>
                        </select>

                        <select className="dropdown" style={{ width: '100%' }} value={curriculumIndex} onChange={handleCurriculumChange} disabled={!semesterIndex || pickedUpSubject}>
                            <option value="">Course</option>
                            {departmentCurriculumsData ?
                                departmentCurriculumsData.map((curriculum, index) => (
                                    <option key={curriculum.CurriculumCode} value={index}>
                                        {curriculum.CurriculumCode}
                                    </option>
                                )) : null
                            }
                        </select>

                        <select className="dropdown" style={{ width: '100%' }} value={yearLevelIndex} onChange={handleYearLevelChange} disabled={!curriculumIndex || pickedUpSubject}>
                            <option value="">Year Level</option>
                            {curriculumIndex ?
                                departmentCurriculumsData[curriculumIndex].YearLevels.map((year_level, index) => (
                                    <option key={index} value={index}>
                                        {year_level.Name}
                                    </option>
                                )) : null
                            }
                        </select>

                        <select className="dropdown" style={{ width: '100%' }} value={sectionIndex} onChange={handleSectionChange} disabled={!yearLevelIndex || pickedUpSubject}>
                            <option value="">Section</option>
                            {yearLevelIndex ?
                                Array.from({ length: departmentCurriculumsData[curriculumIndex].YearLevels[yearLevelIndex].Sections }, (_, index) => (
                                    <option key={index} value={index}>
                                        {`Section ${SECTION_CHARACTERS[index]}`}
                                    </option>
                                )) : null
                            }
                        </select>
                    </div>
                </div>

                {/*================================= TimeTable Table =================================*/}


                {pickedUpSubject ?
                    <div className={`${pickedUpColor} subject-cursor`}
                        style={{
                            height: `${pickedUpSubject.SubjectTimeSlots * cellHeight}px`,
                            width: '13.5%',
                            border: '1px solid black',
                            display: 'flex', flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'fixed',
                            top: `${position.y + 2}px`,
                            left: `${position.x + 2}px`,
                        }}
                    >
                        <div
                            className="subject-content"
                        >
                            <div className="subject-name">{pickedUpSubject.SubjectCode}</div>
                            <div className="instructor">{pickedUpSubject.InstructorLastName}</div>
                            <div className="room">{pickedUpSubject.RoomName}</div>
                        </div>
                    </div> : null
                }

                <table className="time-table" style={{ display: sectionIndex ? 'revert' : 'none' }}>
                    <thead>
                        <tr>
                            <th className="time-slot-header">Time Slot</th>
                            {DAYS.map((day) => (
                                <th key={day} className="day-header">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {generateTimeSlotRowLabels(startHour, timeSlotMinuteInterval, dailyTimeSlots).map((time_slot_label, row_idx) => (
                            <tr key={row_idx}>
                                <td className="time-slot">{time_slot_label}</td>
                                {DAYS.map((_, day_idx) => {
                                    const has_assigned_subject = classAssignedSubjects.find(
                                        (subj) => subj.DayIdx === day_idx && subj.TimeSlotIdx === row_idx
                                    );

                                    if (has_assigned_subject) {
                                        return (
                                            <td
                                                key={day_idx}
                                                className={`subject-cell ${subjectColors[has_assigned_subject.SubjectCode]}`}
                                                rowSpan={has_assigned_subject.SubjectTimeSlots}
                                                onClick={() => {
                                                    handlePickupSubject(has_assigned_subject)
                                                    setPickedUpColor(`subject-cell ${subjectColors[has_assigned_subject.SubjectCode]}`)
                                                }}
                                            >
                                                <div className="subject-content">
                                                    <div className="subject-name">{has_assigned_subject.SubjectCode}</div>
                                                    <div className="instructor">{has_assigned_subject.InstructorLastName}</div>
                                                    <div className="room">{has_assigned_subject.RoomName}</div>
                                                </div>
                                            </td>
                                        );
                                    }

                                    // row spans occupy space in a tr despite not having the td element spanning in that tr,
                                    // that's why this logic is needed because if we didn't do this, we will add empty slots
                                    // to the rows with cells that are affected by a row spans, which could lead to new empty
                                    // slots that can go outside of the table.

                                    const is_occupied = classAssignedSubjects.some((subject) => {
                                        const has_hit_subject_in_row = row_idx >= subject.TimeSlotIdx && row_idx < (subject.TimeSlotIdx + subject.SubjectTimeSlots);
                                        const has_hit_subject_in_col = day_idx == subject.DayIdx;
                                        return has_hit_subject_in_row && has_hit_subject_in_col;
                                    });

                                    if (availableSubjectTimeSlotMove) {
                                        if (availableSubjectTimeSlotMove[day_idx][row_idx]) {
                                            return <td
                                                key={day_idx}
                                                className="empty-slot free-move-slot"
                                                onClick={() => handleDropPickedUpSubject(day_idx, row_idx)}
                                            ></td>;
                                        }
                                    }

                                    return is_occupied ? null : <td key={day_idx} className="empty-slot"></td>;
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                <Box padding={1} gap={1} display={'flex'} justifyContent={'space-evenly'}>
                    <Button
                        size="small"
                        fullWidth
                        onClick={generateDepartmentSchedules}
                        disabled={!semesterIndex || pickedUpSubject}
                        variant="contained"
                        color="success"
                    >
                        Generate Department Semester Schedules
                    </Button>

                    <Button
                        size="small"
                        fullWidth
                        onClick={handleValidateSchedules}
                        disabled={!semesterIndex || pickedUpSubject}
                        variant="contained"
                        color="warning"
                    >
                        Validate Schedules
                    </Button>

                    <Button
                        size="small"
                        fullWidth
                        onClick={handleClearDepartmentSchedule}
                        disabled={!semesterIndex || pickedUpSubject}
                        variant="contained"
                        color="error"
                    >
                        Clear Department Semester Schedules
                    </Button>

                    <Button
                        size="small"
                        fullWidth
                        onClick={handleClearClassSchedule}
                        disabled={!semesterIndex || pickedUpSubject}
                        variant="outlined"
                        color="error"
                    >
                        Clear Section Semester Schedule
                    </Button>

                    {pickedUpSubject ? <Button
                        size="small"
                        fullWidth
                        onClick={handleCancelPickupSubject}
                        disabled={!pickedUpSubject}
                        variant="contained"
                        color="primary"
                    >
                        Cancel Move
                    </Button> : null}
                </Box>
            </div>

            {schedGenStatus ?
                <Box padding={1}>
                    <Typography variant="h6" style={{ color: 'green', textAlign: 'center' }}>
                        {schedGenStatus.Status}
                    </Typography>
                    <Typography variant="body2" style={{ color: 'black', textAlign: 'center' }}>
                        {schedGenStatus.Message}
                    </Typography>
                </Box>
                : null}
        </>
    );
}

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <TimeTable />
    </StrictMode>
);
