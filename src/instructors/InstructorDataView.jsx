import { useState, useEffect, useRef } from "react";

import Button from '@mui/material/Button';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Divider from '@mui/material/Divider';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import { InstructorTimeSlotBitMap } from "../js/instructor-time-slot-bit-map"

import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { generateTimeSlotRowLabels } from "../js/week-time-table-grid-functions";
import { ContextMenu, ContextMenuItem, Position, useContextMenuState } from "../components/ContextMenu";

import { patchUpdateInsturctor, postCreateInsturctor } from "../js/instructors"
import { fetchInstructorResources } from "../js/instructors_v2"

import { Loading, Popup } from "../components/Loading";

import "../assets/SubjectColors.css";

export default function InstructorDataView({
    selectedDepartment,
    selectedInstructor, setSelectedInstructor,
    mode, setMode,
    onInstructorDataViewClose,
    reloadInstructorsTable,
    departments,
    popupOptions, setPopupOptions,
}) {
    const [subjectColors, setSubjectColors] = useState({});

    /////////////////////////////////////////////////////////////////////////////////
    //                       SELECTED TIME SLOT CELL
    /////////////////////////////////////////////////////////////////////////////////

    const [selectedTimeSlots, setSelectedTimeSlots] = useState(new Set())

    /////////////////////////////////////////////////////////////////////////////////
    //                     LOAD GUARD COMPONENT STATES
    /////////////////////////////////////////////////////////////////////////////////

    const [IsLoading, setIsLoading] = useState(false);

    /////////////////////////////////////////////////////////////////////////////////
    //                       TIME TABLE GRID STATES
    /////////////////////////////////////////////////////////////////////////////////

    const [semesterIndex, setSemesterIndex] = useState("");

    const handleSemesterChange = (e) => {
        setSemesterIndex(e.target.value)

        const semester_idx = Number.parseInt(e.target.value, 10)

        if (Number.isInteger(semester_idx)) {
            console.log('selected semester index:', e.target.value)

            setAllocatedSubjectAssign(
                instructorResources.current.semesters_sub_assign[semester_idx]
            )

            const subject_colors = [];
            let subject_count = 0;

            instructorResources.current.semesters_sub_assign[semester_idx].forEach((subject) => {
                if (!subject_colors[`${subject.SubjectCode}${subject.CourseSection}`]) {
                    subject_count++;
                    subject_colors[`${subject.SubjectCode}${subject.CourseSection}`] = `color-${subject_count}`;
                }
            });

            setSubjectColors(subject_colors);

            console.log('allocated time slots:',
                new InstructorTimeSlotBitMap(
                    instructorResources.current.semesters_time_slots[semester_idx]
                )
            )

            console.log('subjects allocated:', instructorResources.current.semesters_sub_assign[semester_idx])
        } else {
            console.log('selected semester index: none')
            setAllocatedSubjectAssign([])
            setSubjectColors([])
        }
    }

    const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [startHour, setStartHour] = useState(7);
    const [timeSlotMinuteInterval, setTimeSlotMinuteInterval] = useState(30);
    const [dailyTimeSlots, setDailyTimeSlots] = useState(24);

    const [isDragSelect, setIsDragSelect] = useState()
    const [instructorBackup, setInstructorBackup] = useState()

    const instructorResources = useRef(null)
    const [baseResourceTimeSlots, setBaseResourceTimeSlots] = useState(new InstructorTimeSlotBitMap())
    const [semsResourceTimeSlots, setSemsResourceTimeSlots] = useState(new InstructorTimeSlotBitMap())
    const [allocatedSubjectAssign, setAllocatedSubjectAssign] = useState([])

    const backupBaseResourceTimeSlots = useRef(null)
    const backupSemsResourceTimeSlots = useRef(null)

    const load_resources = async () => {
        try {
            if (mode == "new") {
                setBaseResourceTimeSlots(new InstructorTimeSlotBitMap())
                setSemsResourceTimeSlots(new InstructorTimeSlotBitMap())
                setSemesterIndex("")

                instructorResources.current = {
                    "base_time_slots": ["0", "0", "0"]
                }

                return
            }

            setIsLoading(true)

            const instructor_resources = await fetchInstructorResources(selectedInstructor.InstructorID)
            console.log('load_resources -> fetchInstructorResources  : ', instructor_resources)

            const base_time_slots = new InstructorTimeSlotBitMap(instructor_resources.base_time_slots)
            const semesters_time_slots = new InstructorTimeSlotBitMap(instructor_resources.base_time_slots)

            for (let i = 0; i < instructor_resources.semesters_time_slots.length; i++) {
                const sem_time_slots = new InstructorTimeSlotBitMap(instructor_resources.semesters_time_slots[i])

                for (let day = 0; day < DAYS.length; day++) {
                    for (let time_slot = 0; time_slot < dailyTimeSlots; time_slot++) {
                        if (!sem_time_slots.getAvailability(day, time_slot)) {
                            semesters_time_slots.setAvailability(false, day, time_slot)
                        }
                    }
                }
            }

            setBaseResourceTimeSlots(base_time_slots)
            setSemsResourceTimeSlots(semesters_time_slots)
            setSemesterIndex("")

            instructorResources.current = instructor_resources
        } catch (err) {
            setPopupOptions({
                Heading: "Page Load Error",
                HeadingStyle: { background: "red", color: "white" },
                Message: `${err}`
            });
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {

        // TODO: fetch basic const values (data below is just temporary);

        const starting_hour = 7;
        const time_slot_per_hour = 2;
        const daily_time_slots = 24;

        const time_slot_minute_interval = 60 / time_slot_per_hour;

        setStartHour(starting_hour);
        setTimeSlotMinuteInterval(time_slot_minute_interval);
        setDailyTimeSlots(daily_time_slots);

        console.log('selectedDepartment :', selectedDepartment)
        setInstructorBackup(structuredClone(selectedInstructor))

        load_resources();

    }, [selectedInstructor]);

    /////////////////////////////////////////////////////////////////////////////////
    //                     CONTEXT MENU HANDLERS
    /////////////////////////////////////////////////////////////////////////////////

    const contextMenuState = useContextMenuState()

    const handleContextMenuEnable = () => {
        console.log('before enable =', selectedInstructor)

        let is_all_enabled = true
        let has_impossible_error = false
        let enabled_time_slots = 0

        for (const value of selectedTimeSlots) {
            let [day, time_slot] = value.split(":")

            day = Number(day)
            time_slot = Number(time_slot)

            const is_default_available = baseResourceTimeSlots?.getAvailability(day, time_slot)
            const is_allocated_available = semsResourceTimeSlots?.getAvailability(day, time_slot)

            if (!is_default_available && !is_allocated_available) {
                enabled_time_slots++
            } else if (!is_default_available && is_allocated_available) {
                has_impossible_error = true
            } else {
                is_all_enabled = false
            }
        }

        if (has_impossible_error) {
            setPopupOptions({
                Heading: "That should not happen!",
                HeadingStyle: { background: "red", color: "white" },
                Message: "we detected an instructor default time slot that is not available yet the corresponding allocation time slot is available"
            });

            return
        } else if (enabled_time_slots === 0) {
            setPopupOptions({
                Heading: "No Action",
                HeadingStyle: { background: "orange", color: "white" },
                Message: "all selected time slots are either enabled or already occupied so no need to enable again"
            });
        } else if (!is_all_enabled) {
            setPopupOptions({
                Heading: "Partially Successful",
                HeadingStyle: { background: "orange", color: "white" },
                Message: `some selected time slots (${selectedTimeSlots.size - enabled_time_slots}/${selectedTimeSlots.size}) are already enabled and/or occupied so no need to enabled again`
            });
        } else {
            setPopupOptions({
                Heading: "Fully Successful",
                HeadingStyle: { background: "green", color: "white" },
                Message: "all selected time slots are enabled"
            });
        }

        for (const value of selectedTimeSlots) {
            let [day, time_slot] = value.split(":")

            day = Number(day)
            time_slot = Number(time_slot)

            const is_default_available = baseResourceTimeSlots?.getAvailability(day, time_slot)
            const is_allocated_available = semsResourceTimeSlots?.getAvailability(day, time_slot)

            if (!is_default_available && !is_allocated_available) {
                baseResourceTimeSlots?.setAvailability(true, day, time_slot)
                semsResourceTimeSlots?.setAvailability(true, day, time_slot)
            }
        }

        setSelectedTimeSlots(new Set())
    }

    const handleContextMenuDisable = () => {
        console.log('before disable =', selectedInstructor)

        let is_all_disabled = true
        let has_impossible_error = false
        let disabled_time_slots = 0

        for (const value of selectedTimeSlots) {
            let [day, time_slot] = value.split(":")

            day = Number(day)
            time_slot = Number(time_slot)

            const is_default_available = baseResourceTimeSlots?.getAvailability(day, time_slot)
            const is_allocated_available = semsResourceTimeSlots?.getAvailability(day, time_slot)

            if (is_default_available && is_allocated_available) {
                disabled_time_slots++
            } else if (!is_default_available && is_allocated_available) {
                has_impossible_error = true
            } else {
                is_all_disabled = false
            }
        }

        if (has_impossible_error) {
            setPopupOptions({
                Heading: "That should not happen!",
                HeadingStyle: { background: "red", color: "white" },
                Message: "we detected an instructor default time slot that is not available yet the corresponding allocation time slot is available"
            });

            return
        } else if (disabled_time_slots === 0) {
            setPopupOptions({
                Heading: "No Action",
                HeadingStyle: { background: "orange", color: "white" },
                Message: "all selected time slots are either disabled or already occupied so no need to disable again"
            });
        } else if (!is_all_disabled) {
            setPopupOptions({
                Heading: "Partially Successful",
                HeadingStyle: { background: "orange", color: "white" },
                Message: `some selected time slots (${selectedTimeSlots.size - disabled_time_slots}/${selectedTimeSlots.size}) are already disabled or occupied so no need to disable again`
            });
        } else {
            setPopupOptions({
                Heading: "Fully Successful",
                HeadingStyle: { background: "green", color: "white" },
                Message: "all selected time slots are disabled"
            });
        }

        for (const value of selectedTimeSlots) {
            let [day, time_slot] = value.split(":")

            day = Number(day)
            time_slot = Number(time_slot)

            const is_default_available = baseResourceTimeSlots?.getAvailability(day, time_slot)
            const is_allocated_available = semsResourceTimeSlots?.getAvailability(day, time_slot)

            if (is_default_available && is_allocated_available) {
                baseResourceTimeSlots?.setAvailability(false, day, time_slot)
                semsResourceTimeSlots?.setAvailability(false, day, time_slot)
            }
        }

        setSelectedTimeSlots(new Set())
    }

    /////////////////////////////////////////////////////////////////////////////////
    //                     TIME SLOT SELECTION BUTTON HANDLERS
    /////////////////////////////////////////////////////////////////////////////////

    const handleEditOrNewAction = async () => {
        console.log('handleEditOrNewAction: called')
        try {
            console.log('handleEditOrNewAction: called 1')

            let new_default_time = []

            for (let i = 0; i < baseResourceTimeSlots.bitset.length; i++) {
                new_default_time.push(`${baseResourceTimeSlots.bitset[i]}`)
            }

            console.log('handleEditOrNewAction: called 2')

            const updated_instructor_time_str = {
                InstructorID: selectedInstructor.InstructorID,
                DepartmentID: selectedInstructor.DepartmentID,
                FirstName: selectedInstructor.FirstName,
                MiddleInitial: selectedInstructor.MiddleInitial,
                LastName: selectedInstructor.LastName,
                Time: new_default_time,
            }

            console.log('handleEditOrNewAction: called 3')

            setIsLoading(true);

            if (mode === "edit") {
                console.log('mode: edit - save changes')

                await patchUpdateInsturctor(updated_instructor_time_str);

                setPopupOptions({
                    Heading: "Edit Successful",
                    HeadingStyle: { background: "green", color: "white" },
                    Message: "changes to the instructor data are saved"
                });
            } else if (mode === "new") {
                console.log('mode: new - save new instructor')

                await postCreateInsturctor(updated_instructor_time_str);

                setPopupOptions({
                    Heading: "Add Successful",
                    HeadingStyle: { background: "green", color: "white" },
                    Message: "a new instructor was added"
                });

                reloadInstructorsTable()
            } else {
                console.log('mode: wrong mode detected')
                throw new Error('there was a problem in the v2 instructor page')
            }

            setIsLoading(false);

        } catch (err) {
            setPopupOptions({
                Heading: "Instructor Update Failed",
                HeadingStyle: { background: "red", color: "white" },
                Message: `${err}`
            });
            setIsLoading(false);
        }
    }

    return (<>
        <ContextMenu
            closeAfterClick={true}
            conextMenuState={contextMenuState}
        >
            <ContextMenuItem onClick={handleContextMenuEnable}>Enable</ContextMenuItem>
            <ContextMenuItem onClick={handleContextMenuDisable}>Disable</ContextMenuItem>
        </ContextMenu>

        <Loading
            IsLoading={IsLoading}
        />

        <Box
            sx={{
                display: "flex",
                // border: '6px solid yellow', // debug border
                flexDirection: 'column'
            }}
        >
            {/* main page heading */}

            <Box
                sx={{
                    display: "flex",
                    flexDirection: 'row',
                    borderBlockEnd: 'thin solid grey',
                    justifyContent: 'space-between',
                    padding: '0.4em',
                }}
            >
                {/* main page heading title */}

                <Box
                    sx={{
                        p: 0, m: 0, height: 'min-content',
                    }}
                >
                    <Typography variant="h5">
                        {mode === "view" ? (
                            'INSTRUCTOR PREVIEW'
                        ) : (mode === "edit" ? (
                            'EDIT INSTRUCTOR'
                        ) : (mode === "new" ? (
                            'ADD NEW INSTRUCTOR'
                        ) : <p>green btn error: unknown mode</p>))}
                    </Typography>
                </Box>

                {/* main page heading buttons */}

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: 'right',
                        p: 0.15,
                        gap: 1,
                        // border: '2px solid green', // debug border
                        m: 0,
                        height: 1
                    }}
                >
                    {mode !== "new" ?
                        <FormControl sx={{ minWidth: 115 }} size="small">
                            <InputLabel id="label-id-semester">Semester</InputLabel>
                            <Select autoWidth
                                labelId="label-id-semester"
                                label="Semester"
                                value={semesterIndex}
                                onChange={handleSemesterChange}
                                disabled={!Number.isInteger(selectedDepartment.DepartmentID) || mode === "edit"}
                            >
                                <MenuItem value=''>None</MenuItem>
                                <MenuItem value={0}>1st Semester</MenuItem>
                                <MenuItem value={1}>2nd Semester</MenuItem>
                                <MenuItem value={2}>Mid-year</MenuItem>
                            </Select>
                        </FormControl> : null
                    }

                    {mode === "view" ? (
                        <Button
                            endIcon={<EditIcon />} size="small" color="primary" variant="contained"
                            onClick={() => {
                                setMode("edit")
                                setInstructorBackup(structuredClone(selectedInstructor))

                                backupBaseResourceTimeSlots.current = new InstructorTimeSlotBitMap(baseResourceTimeSlots.bitset)
                                backupSemsResourceTimeSlots.current = new InstructorTimeSlotBitMap(semsResourceTimeSlots.bitset)
                            }}
                            loading={IsLoading}
                        >
                            Edit
                        </Button>
                    ) : (mode === "edit" ? (
                        <Button
                            endIcon={<DoneIcon />} size="small" color="success" variant="contained"
                            onClick={() => {
                                handleEditOrNewAction()
                                setMode("")
                            }}
                            loading={IsLoading}
                        >
                            Apply Changes
                        </Button>
                    ) : (mode === "new" ? (
                        <Button
                            endIcon={<AddIcon />} size="small" color="success" variant="contained"
                            onClick={() => {
                                handleEditOrNewAction()
                                setMode("")
                            }}
                        >
                            Save New Instructor
                        </Button>
                    ) : <p>green btn error: unknown mode</p>))}

                    {mode === "view" ? (
                        <Button
                            endIcon={<ExitToAppIcon />} size="small" color="error" variant="outlined"
                            onClick={() => {
                                setMode("")
                                onInstructorDataViewClose()
                            }}
                        >
                            Go Back
                        </Button>
                    ) : (mode === "edit" ? (
                        <Button
                            endIcon={<CancelIcon />} size="small" color="error" variant="outlined"
                            onClick={() => {
                                setMode("view")

                                // set the original values of the selected instructors defaults and allocated back to unedited version

                                selectedInstructor.InstructorID = instructorBackup.InstructorID
                                selectedInstructor.DepartmentID = instructorBackup.DepartmentID
                                selectedInstructor.FirstName = instructorBackup.FirstName
                                selectedInstructor.MiddleInitial = instructorBackup.MiddleInitial
                                selectedInstructor.LastName = instructorBackup.LastName
                                selectedInstructor.Time = instructorBackup.Time

                                setBaseResourceTimeSlots(backupBaseResourceTimeSlots.current)
                                setSemsResourceTimeSlots(backupSemsResourceTimeSlots.current)

                                setSelectedTimeSlots(new Set())
                            }}
                        >
                            Cancel
                        </Button>
                    ) : (mode === "new" ? (
                        <Button
                            endIcon={<CancelIcon />} size="small" color="error" variant="outlined"
                            onClick={() => {
                                setMode("")
                                onInstructorDataViewClose()
                            }}
                        >
                            Close
                        </Button>
                    ) : <p>red btn error: unknown mode</p>))}
                </Box>
            </Box>

            {/* second page heading - instructor name display */}

            <Box sx={{ p: 1, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBlockEnd: 'thin solid grey' }}>
                <Box sx={{ display: 'flex', gap: '2em', alignItems: 'baseline' }}>
                    {mode === "view" ? (
                        <>
                            <Typography variant="subtitle2">INSTRUCTOR'S NAME:</Typography>
                            <Typography variant="body1">{` ${selectedInstructor.FirstName} ${selectedInstructor.MiddleInitial}. ${selectedInstructor.LastName}`}</Typography>
                        </>
                    ) : (mode === "edit" ? (

                        // instructor name display

                        <>
                            <TextField variant="outlined" size="small" label="First Name" defaultValue={selectedInstructor.FirstName}
                                onChange={(e) => {
                                    selectedInstructor.FirstName = e.target.value
                                    console.log(`FirstName : ${e.target.value}`)
                                }}
                            />
                            <TextField variant="outlined" size="small" label="M.I." defaultValue={selectedInstructor.MiddleInitial}
                                onChange={(e) => {
                                    selectedInstructor.MiddleInitial = e.target.value
                                    console.log(`MiddleInitial : ${e.target.value}`)
                                }}
                            />
                            <TextField variant="outlined" size="small" label="Last Name" defaultValue={selectedInstructor.LastName}
                                onChange={(e) => {
                                    selectedInstructor.LastName = e.target.value
                                    console.log(`LastName : ${e.target.value}`)
                                }}
                            />
                        </>
                    ) : (mode === "new" ? (
                        <>
                            <TextField variant="outlined" size="small" label="First Name" defaultValue=""
                                onChange={(e) => {
                                    selectedInstructor.FirstName = e.target.value
                                    console.log(`FirstName : ${e.target.value}`)
                                }}
                            />
                            <TextField variant="outlined" size="small" label="M.I." defaultValue=""
                                onChange={(e) => {
                                    selectedInstructor.MiddleInitial = e.target.value
                                    console.log(`MiddleInitial : ${e.target.value}`)
                                }}
                            />
                            <TextField variant="outlined" size="small" label="Last Name" defaultValue=""
                                onChange={(e) => {
                                    selectedInstructor.LastName = e.target.value
                                    console.log(`LastName : ${e.target.value}`)
                                }}
                            />
                        </>
                    ) : <p>green btn error: unknown mode</p>))}
                </Box>

                {mode === "edit" ?
                    <FormControl sx={{ width: 130 }} size="small" fullWidth>
                        <InputLabel id="label-id-edit-department">Department</InputLabel>
                        <Select
                            id="id-edit-department" labelId="label-id-edit-department" label="Department"
                            defaultValue={selectedInstructor?.DepartmentID}
                            onChange={(e) => {
                                console.log('change department : ', departments)
                                selectedInstructor.DepartmentID = Number(e.target.value)
                            }}

                            onClick={() => {
                                console.log('change department : ', departments)
                                console.log('instructor : ', selectedInstructor)
                            }}
                        >
                            {departments ?
                                departments.map((department, index) => {
                                    return <MenuItem key={index} value={department.DepartmentID}>{`${department.Code} - ${department.Name}`}</MenuItem>
                                }) : null
                            }
                        </Select>
                    </FormControl>
                    : <Typography align='right' width={'100%'} variant='body1' fontStyle={'italic'}>
                        {departments.find(dept => dept.DepartmentID == selectedInstructor?.DepartmentID)?.Name || 'Department not found'}
                    </Typography>
                }
            </Box>

        </Box>

        <Divider orientation="vertical" flexItem />
        <Typography align="center" sx={{ background: 'gold', color: 'black', marginBottom: '0.05em' }}>Instructor Availability Time Slot</Typography>

        <Box
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingInline: "1em",
                // border: '4px solid red',  // debug border
            }}
        >
            <Box
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "0.3em",
                    // border: '7px solid green', // debug border
                }}
            >
                {mode === "edit" || mode === "new" ?
                    <Typography variant="subtitle1" fontStyle={'italic'} color="red">
                        select a cell by clicking or click-dragging
                    </Typography> : null
                }
                {mode === "edit" || mode === "new" ? (isDragSelect ?
                    <div style={{ width: "0.8em", height: "0.8em", background: "green" }}></div> :
                    <div style={{ width: "0.8em", height: "0.8em", background: "red" }}></div>
                ) : null}
            </Box>

            {mode === "edit" || mode === "new" ?
                <Typography variant="subtitle1" fontStyle={'italic'} color="red">
                    right click after selecting to open context menu action
                </Typography> : null
            }

            {mode === "edit" || mode === "new" ?
                <Box sx={{ display: "flex", p: 0.15, gap: 1 }}>
                    <Button
                        startIcon={<ClearAllIcon />} size="small" color="secondary" variant="contained"
                        onClick={() => setSelectedTimeSlots(new Set([]))}
                    >
                        Clear Time Slot Selection
                    </Button>
                </Box> : null
            }
        </Box>

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

                            const is_available_default = baseResourceTimeSlots?.getAvailability(day_index, time_slot_index) ? true : false
                            const is_available_alloc = semsResourceTimeSlots?.getAvailability(day_index, time_slot_index) ? true : false
                            const has_assigned_subject = allocatedSubjectAssign.find(
                                (subj) => subj.DayIdx === day_index && subj.TimeSlotIdx === time_slot_index
                            );

                            if (has_assigned_subject) {
                                const subject_color_key = `${has_assigned_subject.SubjectCode}${has_assigned_subject.CourseSection}`
                                return (
                                    <td key={day_index} className={`subject-cell ${subjectColors[subject_color_key]}`} rowSpan={has_assigned_subject.SubjectTimeSlots}>
                                        <div className="subject-content">
                                            <div className="subject-time-slot-line-1">{has_assigned_subject.SubjectCode}</div>
                                            <div className="subject-time-slot-line-2">{has_assigned_subject.CourseSection}</div>
                                            <div className="subject-time-slot-line-3">{has_assigned_subject.RoomName}</div>
                                        </div>
                                    </td>
                                );
                            }

                            if (!is_available_default) {
                                class_name = "disabled-slot"
                            } else if (is_available_default && !is_available_alloc) {
                                class_name = "occupied-slot"
                            } else {
                                class_name = "available-slot"
                            }

                            if (selectedTimeSlots?.has(`${day_index}:${time_slot_index}`)) {
                                selected = "selected-time-slot-cell"
                            }

                            const is_occupied = allocatedSubjectAssign.some((subject) => {
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

                                    onContextMenu={(event) => {
                                        event.preventDefault()

                                        if (mode === "view") {
                                            return
                                        }

                                        console.log(`right click: class="${event.target.className}"`)

                                        const available = semsResourceTimeSlots?.getAvailability(day_index, time_slot_index)
                                        console.log(`day(${day_index}), time_slot(${time_slot_index} = available? ${available})`)

                                        contextMenuState.setShow(true)
                                        contextMenuState.setPosition(new Position(event.clientX, event.clientY))

                                        const is_selected = selectedTimeSlots.has(`${day_index}${time_slot_index}`)

                                        if (!is_selected) {
                                            const new_selected_time_slots = new Set(selectedTimeSlots)
                                            new_selected_time_slots.add(`${day_index}:${time_slot_index}`)
                                            setSelectedTimeSlots(new_selected_time_slots)
                                            console.log(new_selected_time_slots)
                                        }
                                    }}

                                    onMouseDown={(event) => {
                                        if (mode === "view") {
                                            return
                                        }

                                        console.log(`drag start: class="${event.target.className}"`)
                                        setIsDragSelect(true)

                                        const is_selected = selectedTimeSlots.has(`${day_index}${time_slot_index}`)

                                        if (!is_selected) {
                                            const new_selected_time_slots = new Set(selectedTimeSlots)
                                            new_selected_time_slots.add(`${day_index}:${time_slot_index}`)
                                            setSelectedTimeSlots(new_selected_time_slots)
                                            console.log(new_selected_time_slots)
                                        }
                                    }}

                                    onMouseEnter={(event) => {
                                        if (mode === "view") {
                                            return
                                        }

                                        console.log(`dragging: class="${event.target.className}"`)

                                        const is_selected = selectedTimeSlots.has(`${day_index}${time_slot_index}`)

                                        if (!is_selected && isDragSelect) {
                                            const new_selected_time_slots = new Set(selectedTimeSlots)
                                            new_selected_time_slots.add(`${day_index}:${time_slot_index}`)
                                            setSelectedTimeSlots(new_selected_time_slots)
                                            console.log(new_selected_time_slots)
                                        }
                                    }}

                                    onMouseUp={(event) => {
                                        if (mode === "view") {
                                            return
                                        }

                                        console.log(`drag end: class="${event.target.className}"`)
                                        setIsDragSelect(false)
                                    }}
                                >
                                    <span className={`time-slot-cover ${selected}`}></span>
                                </td>
                            )
                        })}
                    </tr>
                ))}
            </tbody>
        </table>

        <div style={{ height: '3.25em' }} />
    </>)
}