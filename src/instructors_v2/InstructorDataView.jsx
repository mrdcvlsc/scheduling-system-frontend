import { useState, useEffect } from "react";

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

export default function InstructorDataView({
    selectedDepartment,
    selectedInstructor, setSelectedInstructor,
    mode, setMode,
    onInstructorDataViewClose
}) {

    const [popupOptions, setPopupOptions] = useState(null);

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

    const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [startHour, setStartHour] = useState(7);
    const [timeSlotMinuteInterval, setTimeSlotMinuteInterval] = useState(30);
    const [dailyTimeSlots, setDailyTimeSlots] = useState(24);

    const [isDragSelect, setIsDragSelect] = useState()
    const [instructorBackup, setInstructorBackup] = useState()

    const [timeSlotBase, setTimeSlotBase] = useState(null)

    const [timeSlot1stSem, setTimeSlot1stSem] = useState(new InstructorTimeSlotBitMap())
    const [subjectAssign1stSem, setSubjectAssign1stSem] = useState(null)

    const [timeSlot2ndSem, setTimeSlot2ndSem] = useState(new InstructorTimeSlotBitMap())
    const [subjectAssign2ndSem, setSubjectAssign2ndSem] = useState(null)

    const [allocatedTimeSlot, setAllocatedTimeSlot] = useState(null)
    const [allocatedSubjectAssign, setAllocatedSubjectAssign] = useState(null)

    const load_resources = async () => {
        try {
            setIsLoading(true)
            const instructor_resources = await fetchInstructorResources(selectedInstructor.InstructorID)
            console.log('useEffect - fetchInstructorResources  : ', instructor_resources)

            setTimeSlotBase(instructor_resources.base);

            setTimeSlot1stSem(new InstructorTimeSlotBitMap(instructor_resources.sem_1st))
            setSubjectAssign1stSem(instructor_resources.sem_1st_sub_assign)

            setTimeSlot2ndSem(new InstructorTimeSlotBitMap(instructor_resources.sem_2nd))
            setSubjectAssign2ndSem(instructor_resources.sem_2nd_sub_assign)

            setIsLoading(false)
        } catch (err) {
            setPopupOptions({
                Heading: "Fetch Failed",
                HeadingStyle: { background: "red", color: "white" },
                Message: "Unable to fetch instructor resources"
            });
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

        setInstructorBackup(structuredClone(selectedInstructor))

        if (mode === "new") {
            console.log('load_resources')
            load_resources();
        }
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

            const is_default_available = selectedInstructor?.Time?.getAvailability(day, time_slot)
            const is_allocated_available = allocatedTimeSlot?.getAvailability(day, time_slot)

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

            const is_default_available = selectedInstructor?.Time?.getAvailability(day, time_slot)
            const is_allocated_available = allocatedTimeSlot?.getAvailability(day, time_slot)

            if (!is_default_available && !is_allocated_available) {
                selectedInstructor.Time.setAvailability(true, day, time_slot)
                allocatedTimeSlot?.setAvailability(true, day, time_slot)
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

            const is_default_available = selectedInstructor?.Time?.getAvailability(day, time_slot)
            const is_allocated_available = allocatedTimeSlot?.getAvailability(day, time_slot)

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

            const is_default_available = selectedInstructor?.Time?.getAvailability(day, time_slot)
            const is_allocated_available = allocatedTimeSlot?.getAvailability(day, time_slot)

            if (is_default_available && is_allocated_available) {
                selectedInstructor.Time.setAvailability(false, day, time_slot)
                allocatedTimeSlot.setAvailability(false, day, time_slot)
            }
        }

        setSelectedTimeSlots(new Set())
    }

    /////////////////////////////////////////////////////////////////////////////////
    //                     TIME SLOT SELECTION BUTTON HANDLERS
    /////////////////////////////////////////////////////////////////////////////////

    const handleEditOrNewAction = async () => {
        try {

            let new_default_time = []

            for (let i = 0; i < selectedInstructor.Time.bitset.length; i++) {
                new_default_time.push(`${selectedInstructor.Time.bitset[i]}`)
            }

            const updated_instructor_time_str = {
                InstructorID: selectedInstructor.InstructorID,
                DepartmentID: selectedInstructor.DepartmentID,
                FirstName: selectedInstructor.FirstName,
                MiddleInitial: selectedInstructor.MiddleInitial,
                LastName: selectedInstructor.LastName,
                Time: new_default_time,
            }

            setIsLoading(true);

            if (mode === "edit") {
                await patchUpdateInsturctor(updated_instructor_time_str);

                setPopupOptions({
                    Heading: "Edit Successful",
                    HeadingStyle: { background: "green", color: "white" },
                    Message: "changes to the instructor data are saved"
                });
            } else if (mode === "new") {
                await postCreateInsturctor(updated_instructor_time_str);

                setPopupOptions({
                    Heading: "Add Successful",
                    HeadingStyle: { background: "green", color: "white" },
                    Message: "a new instructor was added"
                });
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
        <Popup popupOptions={popupOptions} closeButtonActionHandler={() => {
            setPopupOptions(null);
        }} />

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
                    <FormControl sx={{ minWidth: 115 }} size="small">
                        <InputLabel id="label-id-semester">Semester</InputLabel>
                        <Select autoWidth
                            labelId="label-id-semester"
                            label="Semester"
                            value={semesterIndex}
                            onChange={(e) => {
                                setSemesterIndex(e.target.value)

                                switch (Number.parseInt(e.target.value, 10)) {
                                    case 0:
                                        setAllocatedTimeSlot(timeSlot1stSem)
                                        setAllocatedSubjectAssign(subjectAssign1stSem)
                                        break;
                                    case 1:
                                        setAllocatedTimeSlot(timeSlot2ndSem)
                                        setAllocatedSubjectAssign(subjectAssign2ndSem)
                                        break;
                                }
                            }}
                            disabled={!Number.isInteger(selectedDepartment.DepartmentID)}
                        >
                            <MenuItem value={0}>1st Semester</MenuItem>
                            <MenuItem value={1}>2nd Semester</MenuItem>
                        </Select>
                    </FormControl>

                    {mode === "view" ? (
                        <Button
                            endIcon={<EditIcon />} size="small" color="primary" variant="contained"
                            onClick={() => {
                                setMode("edit")
                                setInstructorBackup(structuredClone(selectedInstructor))
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
                <Typography variant="body2" fontStyle={'italic'}>{`${selectedDepartment.Name}`}</Typography>
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

                            const is_available_default = selectedInstructor?.Time?.getAvailability(day_index, time_slot_index) ? true : false
                            const is_available_alloc = allocatedTimeSlot?.getAvailability(day_index, time_slot_index) ? true : false

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

                                        const available = allocatedTimeSlot?.getAvailability(day_index, time_slot_index)
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