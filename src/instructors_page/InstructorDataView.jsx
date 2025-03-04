import { useState, useEffect } from "react";

import Button from '@mui/material/Button';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Divider from '@mui/material/Divider';

import { Box, FormControl, InputLabel, MenuItem, Select, ThemeProvider, Typography, createTheme, TextField } from "@mui/material";
import { generateTimeSlotRowLabels } from "../js/week-time-table-grid-functions";
import { ContextMenu, ContextMenuItem, Position, useContextMenuState } from "../components/ContextMenu";

import { fetchAllDepartments, patchUpdateInsturctor, postCreateInsturctor } from "../js/schedule"
import { Loading, Popup } from "../components/Loading";

export default function InstructorDataView({ selectedDepartment, SelectedInstructorDefault, SelectedInstructorAllocated, mode, setMode, setIsView }) {

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

    const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [startHour, setStartHour] = useState(7);
    const [timeSlotMinuteInterval, setTimeSlotMinuteInterval] = useState(30);
    const [dailyTimeSlots, setDailyTimeSlots] = useState(24);

    const [isDragSelect, setIsDragSelect] = useState()

    useEffect(() => {

        // TODO: fetch basic const values (data below is just temporary);

        const starting_hour = 7;
        const time_slot_per_hour = 2;
        const daily_time_slots = 24;

        const time_slot_minute_interval = 60 / time_slot_per_hour;

        setStartHour(starting_hour);
        setTimeSlotMinuteInterval(time_slot_minute_interval);
        setDailyTimeSlots(daily_time_slots);

        console.log('useEffect - SelectedInstructorDefault  : ', SelectedInstructorDefault)
        console.log('useEffect - SelectedInstructorAllocated: ', SelectedInstructorAllocated)
    }, []);

    /////////////////////////////////////////////////////////////////////////////////
    //                     CONTEXT MENU HANDLERS
    /////////////////////////////////////////////////////////////////////////////////

    const contextMenuState = useContextMenuState()

    const handleContextMenuEnable = () => {
        console.log('before enable =', SelectedInstructorDefault)

        let is_all_enabled = true
        let has_impossible_error = false
        let enabled_time_slots = 0

        for (const value of selectedTimeSlots) {
            let [day, time_slot] = value.split(":")

            day = Number(day)
            time_slot = Number(time_slot)

            const is_default_available = SelectedInstructorDefault?.Time?.getAvailability(day, time_slot)
            const is_allocated_available = SelectedInstructorAllocated?.Time?.getAvailability(day, time_slot)

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

            const is_default_available = SelectedInstructorDefault?.Time?.getAvailability(day, time_slot)
            const is_allocated_available = SelectedInstructorAllocated?.Time?.getAvailability(day, time_slot)

            if (!is_default_available && !is_allocated_available) {
                SelectedInstructorDefault.Time.setAvailability(true, day, time_slot)
                SelectedInstructorAllocated.Time.setAvailability(true, day, time_slot)
            }
        }

        // setSelectedInstructorAllocated(SelectedInstructorAllocated)
        // setSelectedInstructorDefault(SelectedInstructorDefault)

        setSelectedTimeSlots(new Set())
    }

    const handleContextMenuDisable = () => {
        console.log('before disable =', SelectedInstructorDefault)

        let is_all_disabled = true
        let has_impossible_error = false
        let disabled_time_slots = 0

        for (const value of selectedTimeSlots) {
            let [day, time_slot] = value.split(":")

            day = Number(day)
            time_slot = Number(time_slot)

            const is_default_available = SelectedInstructorDefault?.Time?.getAvailability(day, time_slot)
            const is_allocated_available = SelectedInstructorAllocated?.Time?.getAvailability(day, time_slot)

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

            const is_default_available = SelectedInstructorDefault?.Time?.getAvailability(day, time_slot)
            const is_allocated_available = SelectedInstructorAllocated?.Time?.getAvailability(day, time_slot)

            if (is_default_available && is_allocated_available) {
                SelectedInstructorDefault.Time.setAvailability(false, day, time_slot)
                SelectedInstructorAllocated.Time.setAvailability(false, day, time_slot)
            }
        }

        // setSelectedInstructorAllocated(SelectedInstructorAllocated)
        // setSelectedInstructorDefault(SelectedInstructorDefault)

        setSelectedTimeSlots(new Set())
    }

    /////////////////////////////////////////////////////////////////////////////////
    //                     TIME SLOT SELECTION BUTTON HANDLERS
    /////////////////////////////////////////////////////////////////////////////////

    const handleEditOrNewAction = async () => {
        try {

            let new_default_time = []

            for (let i = 0; i < SelectedInstructorDefault.Time.bitset.length; i++) {
                new_default_time.push(`${SelectedInstructorDefault.Time.bitset[i]}`)
            }

            const updated_instructor_time_str = {
                InstructorID: SelectedInstructorDefault.InstructorID,
                DepartmentID: SelectedInstructorDefault.DepartmentID,
                FirstName: SelectedInstructorDefault.FirstName,
                MiddleInitial: SelectedInstructorDefault.MiddleInitial,
                LastName: SelectedInstructorDefault.LastName,
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
            <Box
                sx={{
                    display: "flex",
                    flexDirection: 'row',
                    // border: '2px solid red', // debug border
                    justifyContent: 'space-between'
                }}
            >
                <Box>
                    <Typography variant="h4">
                        {mode === "view" ? (
                            'Instructor Preview'
                        ) : (mode === "edit" ? (
                            'Edit Instructor'
                        ) : (mode === "new" ? (
                            'Add New Instructor'
                        ) : <p>green btn error: unknown mode</p>))}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: 'right',
                        p: 0.15,
                        gap: 1,
                        // border: '5px solid green' // debug border
                    }}
                >
                    {mode === "view" ? (
                        <Button
                            endIcon={<EditIcon />} size="medium" color="primary" variant="contained"
                            onClick={() => {
                                setMode("edit")
                            }}
                            loading={IsLoading}
                        >
                            Edit
                        </Button>
                    ) : (mode === "edit" ? (
                        <Button
                            endIcon={<DoneIcon />} size="medium" color="success" variant="contained"
                            onClick={handleEditOrNewAction} loading={IsLoading}
                        >
                            Apply Changes
                        </Button>
                    ) : (mode === "new" ? (
                        <Button
                            endIcon={<AddIcon />} size="medium" color="success" variant="contained"
                            onClick={() => {
                                handleEditOrNewAction()
                                setIsView(false)
                            }}
                        >
                            Save New Instructor
                        </Button>
                    ) : <p>green btn error: unknown mode</p>))}

                    {mode === "view" ? (
                        <Button
                            endIcon={<CancelIcon />} size="medium" color="error" variant="outlined"
                            onClick={() => {
                                setIsView(false)
                            }}
                        >
                            Close
                        </Button>
                    ) : (mode === "edit" ? (
                        <Button
                            endIcon={<CancelIcon />} size="medium" color="error" variant="outlined"
                            onClick={() => {
                                setMode("view")
                            }}
                        >
                            Cancel
                        </Button>
                    ) : (mode === "new" ? (
                        <Button
                            endIcon={<CancelIcon />} size="medium" color="error" variant="outlined"
                            onClick={() => {
                                setIsView(false)
                            }}
                        >
                            Close
                        </Button>
                    ) : <p>red btn error: unknown mode</p>))}
                </Box>
            </Box>

            {mode === "view" ? (
                <Box sx={{ p: 2, width: '100%', display: 'flex', justifyContent: 'left', gap: '1em' }}>
                    <Typography variant="h5">{`${SelectedInstructorDefault.FirstName} ${SelectedInstructorDefault.MiddleInitial}. ${SelectedInstructorDefault.LastName}`}</Typography>
                </Box>
            ) : (mode === "edit" ? (
                <Box
                    sx={{
                        p: 2,
                        // border: '1px dashed grey', // debug border
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'left',
                        gap: '1em'
                    }}
                >
                    <TextField variant="filled" label="First Name" defaultValue={SelectedInstructorDefault.FirstName}
                        onChange={(e) => {
                            SelectedInstructorDefault.FirstName = e.target.value
                            console.log(`FirstName : ${e.target.value}`)
                        }}
                    />
                    <TextField variant="filled" label="M.I." defaultValue={SelectedInstructorDefault.MiddleInitial}
                        onChange={(e) => {
                            SelectedInstructorDefault.MiddleInitial = e.target.value
                            console.log(`MiddleInitial : ${e.target.value}`)
                        }}
                    />
                    <TextField variant="filled" label="Last Name" defaultValue={SelectedInstructorDefault.LastName}
                        onChange={(e) => {
                            SelectedInstructorDefault.LastName = e.target.value
                            console.log(`LastName : ${e.target.value}`)
                        }}
                    />
                </Box>
            ) : (mode === "new" ? (
                <Box sx={{
                    p: 2,
                    // border: '1px dashed grey', // debug border
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'left',
                    gap: '1em'
                }}
                >
                    <TextField variant="filled" label="First Name" defaultValue=""
                        onChange={(e) => {
                            SelectedInstructorDefault.FirstName = e.target.value
                            console.log(`FirstName : ${e.target.value}`)
                        }}
                    />
                    <TextField variant="filled" label="M.I." defaultValue=""
                        onChange={(e) => {
                            SelectedInstructorDefault.MiddleInitial = e.target.value
                            console.log(`MiddleInitial : ${e.target.value}`)
                        }}
                    />
                    <TextField variant="filled" label="Last Name" defaultValue=""
                        onChange={(e) => {
                            SelectedInstructorDefault.LastName = e.target.value
                            console.log(`LastName : ${e.target.value}`)
                        }}
                    />
                </Box>
            ) : <p>green btn error: unknown mode</p>))}
        </Box>

        <Divider orientation="vertical" flexItem />
        <Typography align="center" sx={{ background: 'black', color: 'white', marginBottom: '0.05em' }}>Instructor Availability Time Slot</Typography>

        <div
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingInline: "1em",
                // border: '4px solid red',  // debug border
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "0.6em",
                    // border: '7px solid green', // debug border
                }}
            >
                <p>{mode === "edit" || mode === "new" ? 'time slot drag select' : ''}
                </p>
                {mode === "edit" || mode === "new" ? (isDragSelect ?
                    <div style={{ width: "0.8em", height: "0.8em", background: "green" }}></div> :
                    <div style={{ width: "0.8em", height: "0.8em", background: "red" }}></div>
                ) : null}
            </div>

            {mode === "edit" || mode === "new" ?
                <Box sx={{ display: "flex", p: 0.15, gap: 1 }}>
                    <Button
                        startIcon={<ClearAllIcon />} size="medium" color="primary" variant="contained"
                        onClick={() => setSelectedTimeSlots(new Set([]))}
                    >
                        Clear Time Slot Selection
                    </Button>
                </Box> : null
            }
        </div>

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

                            const is_available_default = SelectedInstructorDefault?.Time?.getAvailability(day_index, time_slot_index) ? true : false
                            const is_available_alloc = SelectedInstructorAllocated?.Time?.getAvailability(day_index, time_slot_index) ? true : false

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

                                        const available = SelectedInstructorAllocated?.Time?.getAvailability(day_index, time_slot_index)
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
    </>)
}