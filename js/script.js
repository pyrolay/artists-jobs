// Selector functions
const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => document.querySelectorAll(selector)

// Global Helper Functions
const hideElement = (document) => $(`${document}`).classList.add("hide")
const showElement = (document) => $(`${document}`).classList.remove("hide")

const showSpinner = (document) => {
    $(document).innerHTML = `
        <div class="loader">
            <div class="loader-inner">
                <div class="loader-line-wrap">
                    <div class="loader-line"></div>
                </div>
                <div class="loader-line-wrap">
                    <div class="loader-line"></div>
                </div>
                <div class="loader-line-wrap">
                    <div class="loader-line"></div>
                </div>
                <div class="loader-line-wrap">
                    <div class="loader-line"></div>
                </div>
                <div class="loader-line-wrap">
                    <div class="loader-line"></div>
                </div>
            </div>
        </div>
    `
}

const capitalizeString = (string) => {
    const result = string.charAt(0).toUpperCase() + string.slice(1)
    return result
}

let editJobSection = false

const formNewOrEdit = (jobId = "") => {
    if (editJobSection) {
        $(".form-change").innerText = "Edit Job"
        $(".exit-form").classList.add("hide")
        editJobInputs(jobId)
    } else {
        $(".form-change").innerText = "New Job"
        $(".exit-form").classList.remove("hide")
        $("#form").reset()
    }
}

// Async functions

const getJobs = async (search = "") => {
    const res = await fetch(`https://637ebce4cfdbfd9a63b65e2f.mockapi.io/jobs/${search}`)
    const jobs = await res.json()
    return jobs
}

const addJob = () => {
    fetch('https://637ebce4cfdbfd9a63b65e2f.mockapi.io/jobs', {
        method: 'POST', 
        headers: {
            'Content-Type': 'Application/json'
        },
        body: JSON.stringify(saveJob())
    }).finally(() => {
        hideElement(".job-form")
        showElement(".main-section")
        $(".filter-form").reset()
        callDataForCards()
    })
}

const editJob = (jobId) => {
    fetch(`https://637ebce4cfdbfd9a63b65e2f.mockapi.io/jobs/${jobId}`, {
        method: "PUT", 
        headers: {
            'Content-Type': 'Application/json'
        },
        body: JSON.stringify(saveJob())
    }).finally(() => {
        hideElement(".job-form")
        showElement(".main-section")
        $(".filter-form").reset()
        callDataForCards()
    })
}

const deleteJob = (jobId) => {
    fetch(`https://637ebce4cfdbfd9a63b65e2f.mockapi.io/jobs/${jobId}`, {
        method: "DELETE"
    }).finally(() => {
        $(".filter-form").reset()
        goBackHome()
    })
}


// Functions

const catchError = (document) => {
    $(".jobs-found").innerHTML = "0 jobs"
    $(`${document}`).innerHTML = ""
    $(`${document}`).innerHTML = `
        <p class="error">There was an error. Please try again.</p>
    `
}

const notFoundJobs = () => {
    $(".jobs-found").innerHTML = "0 jobs"
    $(".card-container").innerHTML = ""
    $(".card-container").innerHTML = `
        <p class="error">No results found.</p>
    `
}

const getTodaysDate = () => {
    const newDate = new Date()
    const today = [newDate.getMonth() + 1, newDate.getDate(), newDate.getFullYear()]
    return today.join("-")
}

const formatDate = (date) => {
    date = new Date(date)
    const getDate = [date.getDate(), date.getMonth() + 1, date.getFullYear()]
    return getDate.join("/")
}

const getLocationsOfJobs = (jobs) => {
    const locations = []
    for (const { location } of jobs) {
        if (!locations.includes(location)) locations.push(location)
    }
    return locations
}

const setCheckedToSameValue = (input, value) => {
    if (value) {
        $(`#${input}-yes`).checked = true
        $(`#${input}-no`).checked = false
    } else {
        $(`#${input}-no`).checked = true
        $(`#${input}-yes`).checked = false
    }
}

const callDataForCards = () => {
    $(".jobs-found").innerHTML = '0 jobs'
    showSpinner(".card-container")
    getJobs().then(jobs => {
        setTimeout(() => {
            setLocationsInSelect(getLocationsOfJobs(jobs))
            searchByName(generateCards(jobs))
        }, 2000);
    }).catch(() => catchError(".card-container"))
}

const editJobInputs = (job) => {
    const { company, name, description, location, category, experience, salary, remote, type } = job
    $("#company-name").value = company
    $("#job-name").value = name
    $("#job-description").value = description
    $("#job-location").value = location
    $("#job-category").value = category
    setCheckedToSameValue("experience", experience)
    $("#job-salary").value = salary
    setCheckedToSameValue("remote", remote)
    $("#job-type").checked = type
}

const saveJob = () => {
    return {
        company: capitalizeString($("#company-name").value),
        name: capitalizeString($("#job-name").value),
        description: capitalizeString($("#job-description").value),
        location: capitalizeString($("#job-location").value),
        category: $("#job-category").value,
        experience: $(".experience-radio").checked,
        salary: $("#job-salary").value,
        posted: getTodaysDate(),
        remote: $(".remote-radio").checked,
        type: $("#job-type").value,
    }
}


// Filter Functions

const isEmpty = (array) => array.length === 0 

const searchByName = () => {
    if ($("#search-name").value === "") {
        getJobs().then((jobs) => filterSearchFunction(jobs)).catch(() => catchError(".card-container") )
    } else {
        const searchBy = `?name=${$("#search-name").value}`
        getJobs(searchBy).then((jobs) => {
            if (jobs.length !== 0) filterSearchFunction(jobs)
            else notFoundJobs()
        }).catch(() => catchError(".card-container"))
    }
}

const filterSearchFunction = (jobsArr) => {
    let filterCategory, filterExperience, filterRemote, filterEmploymentType

    const filterLocation = filterBy(jobsArr, $("#search-location"), "location")
    filterCategory = filterBy(filterLocation, $("#category"), "category")

    if (isEmpty(filterCategory)) return notFoundJobs()
    else filterExperience = filterBy(filterCategory, $("#experience"), "experience")

    if (isEmpty(filterExperience)) return notFoundJobs()
    else filterRemote = filterBy(filterExperience, $("#remote"), "remote")

    if (isEmpty(filterRemote)) return notFoundJobs()
    else filterEmploymentType = filterBy(filterRemote, $("#type"), "type")

    if (isEmpty(filterEmploymentType)) return notFoundJobs()
    else return orderBy(filterEmploymentType)
}

const filterBy = (arr, inputName, search) => {
    if (inputName.value === "All") {
        return arr
    } else {
        const filter = arr.filter(job => job[search].toString() === inputName.value)
        return filter
    }
}

const orderBy = (jobsArr) => {
    const changeDate = (sort) => {
        const date = new Date(sort.posted)
        return date.getTime()
    }

    if ($("#orderBy").value === "1") jobsArr.sort((a, b) => changeDate(b) - changeDate(a))
    if ($("#orderBy").value === "2") jobsArr.sort((a, b) => changeDate(a) - changeDate(b))

    if ($("#orderBy").value === "3") {
        jobsArr.sort((a, b) => {
            if (a.name < b.name) return -1
            if (a.name > b.name) return 1
        })
    }
    if ($("#orderBy").value === "4") {
        jobsArr.sort((a, b) => {
            if (a.name > b.name) return -1
            if (a.name < b.name) return 1
        })
    }
    
    return generateCards(jobsArr)
}

// Navigation functions

const setBtnReturn = () => {
    $(".btn-return").addEventListener("click", () => {
        $("html").style = "scroll-behavior: smooth"
        hideElement("#jobData")
        showElement(".main-section")
        callDataForCards()
    })
}

const goBackHome = () => {
    hideElement(".job-data")
    hideElement(".job-form")
    showElement(".main-section")
    callDataForCards()
}

const scrollChangeNavbarColor = () => {
    if (window.pageYOffset > 150) {
        $(".navbar").style.backgroundColor = "#84495F"
        $(".navbar").style.borderBottom = "2px solid black"
    } else {
        $(".navbar").removeAttribute("style")
    }
}


// DOM

const setLocationsInSelect = (locations) => {
    $("#search-location").innerHTML = '<option value="All">All Locations</option>'
    for (const location of locations) {
        $("#search-location").innerHTML += 
        `<option value="${location}">${location}</option>`
    }
}

const generateCards = (jobs) => {
    $(".card-container").innerHTML = ""
    $(".jobs-found").innerHTML = `${jobs.length} jobs`
    for (const job of jobs) {
        const { category, company, experience, id, location, name, type, posted, remote } = job
        $(".card-container").innerHTML += `
            <div class="card" id="${id}">
                <div class="job-title">
                    <h2>${name}</h2>
                    <a href="#jobData" class="btn-see-job">
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
                <p class="company-name">${company}</p>
                <p class="job-type">${location}</p>
                <div class="tags">
                    <span class="tag">${type}</span>
                    ${experience ? '<span class="tag">Experienced</span>' : ""}
                    ${remote ? '<span class="tag">Remote</span>' : ""}
                    <span class="tag">${category}</span>
                </div>
                <p class="date">posted ${formatDate(posted)}</p>
            </div>
        `
    }

    for (const card of $$(".card")) {
        card.addEventListener("click", () => {
            const jobId = card.id
            $("html").style = "scroll-behavior: unset"
            hideElement(".main-section")
            btnReturnFunctions()
            showElement("#jobData")
            showElement(".job-info")
            hideElement(".delete-section")
            showSpinner(".job-info")
            setTimeout(() => {
                getJobs(jobId).then(job => generateJob(job)).catch(() => catchError(".job-info"))
            }, 2000);
        })
    }
}

const btnReturnFunctions = () => {
    $(".btn-job").innerHTML = `
        <a href="#jobs-section" class="btn-return">
            <i class="fa-solid fa-arrow-left"></i>
        </a>
    `
    setBtnReturn()
}

const generateJob = (jobId) => {
    const { company, name, description, location, experience, salary, posted, remote, type, id } = jobId

    $(".job-info").innerHTML = `
        <div class="job-title">
            <div class="title">
                <h2>${name}</h2>
                <div class="job-management">
                    <button id="editJob" data-id="${id}">
                        <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button id="deleteJob" data-id="${id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
            <p class="job-details">${company} <span>🏢</span></p>
            <p class="job-details">${location} <span>📌</span></p>
            <p class="date job-details">posted ${formatDate(posted)}</p>
        </div>
        <div class="job-description">
            ${salary !== "" ? 
            `<p class="employment-data">💵 Salary:</p>
            <p>👉🏻 ${salary}</p>` : "<p></p>"}
            <div class="employment">
                <p class="job-details">
                    <p class="employment-data">⌚ Type:</p>
                    <p>👉🏻 ${type}</p>
                </p>
                <p class="job-details">
                    <p class="employment-data">👩🏻‍💻 Remote:</p>
                    <p>👉🏻 ${remote ? "Yes" : "No"}</p>
                </p>
                <p class="job-details">
                    <p class="employment-data">👩🏻‍💼 Experience:</p>
                    <p>👉🏻 ${experience ? "Needed" : "No needed"}</p>
                </p>
            </div>
            <p class="description">${description}</p>
        </div>
    `

    $("#deleteJob").addEventListener("click", () => {
        deleteJobFunction(jobId)
    })
    
    $("#editJob").addEventListener("click", () => {
        $(".submitBtn").setAttribute("data-id", id)
        $(".cancelFormBtn").setAttribute("data-id", id)
        hideElement(".main-section")
        hideElement(".job-data")
        showElement(".job-form")
        editJobSection = true
        formNewOrEdit(jobId)
    })
}

const deleteJobFunction = (jobId) => {
    hideElement(".job-info")
    showElement(".delete-section")

    $(".delete-btn").setAttribute("data-id", jobId.id)

    $(".jobName").innerHTML = `${jobId.name}`

    $(".delete-btn").addEventListener("click", () => {
        const id = $(".delete-btn").getAttribute("data-id")
        deleteJob(id)
    })

    $(".cancel-btn").addEventListener("click", () => {
        hideElement(".delete-section")
        showElement(".job-info")
    })
}


// Events 

$("#form").addEventListener("submit", (e) => {
    e.preventDefault()
    const jobId = $(".submitBtn").getAttribute("data-id")
    if (editJobSection) editJob(jobId)
    else addJob()
})

$(".filter-form").addEventListener("submit", (e) => {
    e.preventDefault()
    showSpinner(".card-container")
    setTimeout(() => {
        searchByName()
    }, 2000)
})

$(".clean-form").addEventListener("click", () => {
    $(".filter-form").reset()
    callDataForCards()
})


// Navigation events

$("#openNewJobForm").addEventListener("click", () => {
    hideElement(".main-section")
    hideElement(".job-data")
    showElement(".job-form")
    editJobSection = false
    formNewOrEdit()
})

$(".exit-form").addEventListener("click", () => goBackHome())

$(".cancelFormBtn").addEventListener("click", () => {
    if (editJobSection) {
        hideElement(".job-form")
        showElement("#jobData")
    } else goBackHome()
})


// Window events

window.addEventListener("load", () => {
    callDataForCards()
    btnReturnFunctions()
})

window.addEventListener("click", (e) => {
    if (!e.target.matches('.menu-icon')) {
        const menus = $$(".dropdown-menu")
        for (const menu of menus) {
            if (menu.classList.contains('show')) menu.classList.remove('show')
        }
    }
})

window.addEventListener("scroll", () => {
    scrollChangeNavbarColor()
})