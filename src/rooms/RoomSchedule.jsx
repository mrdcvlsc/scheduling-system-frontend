import { Box, Button, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { Loading } from "../components/Loading";

import { fetchRoomAllocation } from "../js/rooms";
import { generateTimeSlotRowLabels } from "../js/week-time-table-grid-functions";

import { useReactToPrint } from "react-to-print";

import PrintIcon from '@mui/icons-material/Print';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import "../schedule/TimeTable.css";
import "../schedule/TimeTableDropdowns.css";
import "../assets/SubjectColors.css";

const SEMESTER_NAMES = [
    "1st Semester",
    "2nd Semester",
    "Mid-year",
]

export default function RoomSchedule({
    roomToView, setRoomToView, setIsViewRoomSchedule,
    selectedDepartment,
    popupOptions, setPopupOptions,
}) {
    const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [startHour, setStartHour] = useState(7);
    const [timeSlotMinuteInterval, setTimeSlotMinuteInterval] = useState(30);
    const [dailyTimeSlots, setDailyTimeSlots] = useState(24);

    const [subjectColors, setSubjectColors] = useState({});
    const [subjects, setSubjects] = useState([])
    const [selectedSemesterSubject, setSelectedSemesterSubject] = useState([])
    const [IsLoading, setIsLoading] = useState(false)

    const [semesterIndex, setSemesterIndex] = useState("");

    useEffect(() => {
        const starting_hour = 7;
        const time_slot_per_hour = 2;
        const daily_time_slots = 24;

        const time_slot_minute_interval = 60 / time_slot_per_hour;

        setStartHour(starting_hour);
        setTimeSlotMinuteInterval(time_slot_minute_interval);
        setDailyTimeSlots(daily_time_slots);

        const async_use_effect = async () => {
            setIsLoading(true)

            try {
                const room_subject_allocation = await fetchRoomAllocation(roomToView.RoomID)
                setSubjects(room_subject_allocation)
            } catch (err) {
                setSubjects([])
                setPopupOptions({
                    Heading: "Unable To Load Room Schedule",
                    HeadingStyle: { background: "red", color: "white" },
                    Message: `${err}`
                });
            } finally {
                setIsLoading(false)
            }
        }

        async_use_effect();

    }, []);

    const handleSemesterChange = async (e) => {
        setSemesterIndex(e.target.value)

        const semester_idx = Number.parseInt(e.target.value, 10)

        if (Number.isInteger(semester_idx)) {

            console.log('selected semester index:', e.target.value)

            const subject_colors = [];
            let subject_count = 0;

            subjects[semester_idx].forEach((subject) => {
                if (!subject_colors[`${subject.SubjectCode}${subject.CourseSection}`]) {
                    subject_count++;
                    subject_colors[`${subject.SubjectCode}${subject.CourseSection}`] = `color-${subject_count}`;
                }
            });

            setSelectedSemesterSubject(subjects[semester_idx])
            setSubjectColors(subject_colors);

            console.log('subjects allocated:', subjects[semester_idx])
        } else {
            console.log('selected semester index: none')
            setSelectedSemesterSubject([])
            setSubjectColors([])
        }
    }

    const handleBackButton = () => {
        setRoomToView(false)
        setIsViewRoomSchedule(null)
    }

    /////////////////////////////////////////////////////////////////////////////////
    //                      PRINTING STATES, REFS AND HANDLERS
    /////////////////////////////////////////////////////////////////////////////////

    const [isPrinting, setIsPrinting] = useState(false);
    const contentRef = useRef(null);

    const promiseResolveRef = useRef(null);

    useEffect(() => {
        if (isPrinting && promiseResolveRef.current) {
            promiseResolveRef.current();
        }
    }, [isPrinting]);

    const reactToPrintFn = useReactToPrint({
        contentRef,
        documentTitle: `${roomToView.Name} - ${SEMESTER_NAMES[semesterIndex]} ${new Date().getFullYear()}`,
        onBeforePrint: () => {
            return new Promise((resolve) => {
                promiseResolveRef.current = resolve;
                setIsPrinting(true);
            });
        },
        onAfterPrint: () => {
            promiseResolveRef.current = null;
            setIsPrinting(false);
        }
        ,
    });

    /////////////////////////////////////////////////////////////////////////////////

    return (<>
        <Loading
            IsLoading={IsLoading}
        />

        <Box padding={1} display={'flex'} justifyContent={'space-between'}>
            <Box display={'flex'} gap={5} alignItems={'center'}>
                <FormControl sx={{ minWidth: 115 }} size="small">
                    <InputLabel id="label-id-semester">Semester</InputLabel>
                    <Select autoWidth
                        labelId="label-id-semester"
                        label="Semester"
                        value={semesterIndex}
                        onChange={handleSemesterChange}
                        disabled={!Number.isInteger(selectedDepartment.DepartmentID)}
                    >
                        <MenuItem value=''>None</MenuItem>
                        <MenuItem value={0}>1st Semester</MenuItem>
                        <MenuItem value={1}>2nd Semester</MenuItem>
                        <MenuItem value={2}>Mid-year</MenuItem>
                    </Select>
                </FormControl>

                <Box display={'flex'} gap={1}>
                    <Typography variant="h5">Room - {roomToView.Name}</Typography>
                </Box>
            </Box>

            <Box>
                <Button variant="outlined" size="small" endIcon={<ExitToAppIcon />} onClick={handleBackButton}>Go Back</Button>
            </Box>
        </Box>

        <div ref={contentRef} style={{ padding: (isPrinting && Number.isInteger(Number.parseInt(semesterIndex, 10))) ? '1em' : '0px' }}>

            {(isPrinting && Number.isInteger(Number.parseInt(semesterIndex, 10))) ? (<>
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} padding={1} bgcolor={'green'} marginBottom={2}>
                    <Typography variant="h5" color={'white'}>Cavite Statue University - Silang Campus</Typography>
                </Box>

                <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} marginBottom={1}>
                    <Typography variant="h6">{
                        `${roomToView.Name} Schedule`
                    }</Typography>

                    <Typography variant="h6">{
                        `${SEMESTER_NAMES[semesterIndex]} - ${new Date().getFullYear()}`
                    }</Typography>
                </Box>


            </>) : null}


            <table className="time-table">
                <thead>
                    <tr>
                        <th className="time-slot-header">Time Slot</th>
                        {DAYS.map((day) => (
                            <th key={day} className="day-header">{day}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {generateTimeSlotRowLabels(startHour, timeSlotMinuteInterval, dailyTimeSlots).map((time_slot_label, time_slot_index) => (
                        <tr key={time_slot_index}>
                            <td className="time-slot">{time_slot_label}</td>
                            {DAYS.map((_, day_index) => {
                                let class_name = ""
                                let selected = ""

                                console.log('what is this then? = ', selectedSemesterSubject)

                                const has_assigned_subject = selectedSemesterSubject.find(
                                    (subj) => subj.DayIdx === day_index && subj.TimeSlotIdx === time_slot_index
                                );

                                if (has_assigned_subject) {
                                    const subject_color_key = `${has_assigned_subject.SubjectCode}${has_assigned_subject.CourseSection}`
                                    return (
                                        <td key={day_index} className={`subject-cell ${subjectColors[subject_color_key]}`} rowSpan={has_assigned_subject.SubjectTimeSlots}>
                                            <div className="subject-content">
                                                <div className="subject-time-slot-line-1">{has_assigned_subject.SubjectCode}</div>
                                                <div className="subject-time-slot-line-2">{has_assigned_subject.CourseSection}</div>
                                                <div className="subject-time-slot-line-3">{has_assigned_subject.InstructorName}</div>
                                            </div>
                                        </td>
                                    );
                                }

                                // if (mode === "view") {
                                class_name = "empty-slot"
                                // } else {
                                //     class_name = "available-slot"
                                // }

                                // if (selectedTimeSlots?.has(`${day_index}:${time_slot_index}`)) {
                                //     selected = "selected-time-slot-cell"
                                // }

                                const is_occupied = selectedSemesterSubject.some((subject) => {
                                    const has_hit_subject_in_row = time_slot_index >= subject.TimeSlotIdx && time_slot_index < (subject.TimeSlotIdx + subject.SubjectTimeSlots);
                                    const has_hit_subject_in_col = day_index == subject.DayIdx;
                                    return has_hit_subject_in_row && has_hit_subject_in_col;
                                });

                                if (is_occupied) {
                                    return null
                                }

                                return (
                                    <td
                                        key={day_index}
                                        className={class_name}
                                    >
                                        <span className={`time-slot-cover ${selected}`}></span>
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div style={{ height: '0.8em' }} />

        <Box display={(Number.isInteger(Number.parseInt(semesterIndex, 10))) ? 'flex' : 'none'} justifyContent={'center'}>
            <Button variant="outlined" size="medium" onClick={reactToPrintFn} endIcon={<PrintIcon />}>Print</Button>
        </Box>

        <div style={{ height: '3.25em' }} />
    </>)
}