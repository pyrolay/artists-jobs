// Selector functions
const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => document.querySelectorAll(selector)

// Global Helper Functions
const hideElement = (document) => {
    $(`${document}`).classList.remove("show")
    $(`${document}`).classList.add("hide")
}

const showElement = (document) => {
    $(`${document}`).classList.remove("hide")
    $(`${document}`).classList.add("show")
}

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
    $("#job-type").value = type
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

const isEmpty = (array) => {
    if (array.length === 0) return true
    else return false
} 

const searchByName = () => {
    if ($("#search-name").value === "") {
        getJobs().then((jobs) => filterByLocation(jobs)).catch(() => catchError(".card-container"))
    } else {
        const searchBy = `?name=${$("#search-name").value}`
        getJobs(searchBy).then((jobs) => {
            if (jobs.length !== 0) filterByLocation(jobs)
            else notFoundJobs()
        }).catch(() => catchError(".card-container"))
    }
}

const filterByLocation = (jobsArr) => {
    if ($("#search-location").value === "All") {
        return filterByCategory(jobsArr)
    } else {
        const filterByLocation = jobsArr.filter(({ location }) => location === $("#search-location").value)
        if (isEmpty(filterByLocation)) return notFoundJobs()
        else return filterByCategory(filterByLocation)
    }
}

const filterByCategory = (jobsArr) => {
    if ($("#category").value === "All") {
        return filterByExperience(jobsArr)
    } else {
        const filterByCategory = jobsArr.filter(({ category }) => category === $("#category").value)
        if (isEmpty(filterByCategory)) return notFoundJobs()
        else return filterByExperience(filterByCategory)
    }
}

const filterByExperience = (jobsArr) => {
    if ($("#experience").value === "All") {
        return filterByRemote(jobsArr)
    } else {
        const filterByExperience = jobsArr.filter(({ experience }) => experience === $("#experience").value)
        if (isEmpty(filterByExperience)) return notFoundJobs()
        else return filterByRemote(filterByExperience)
    }
}

const filterByRemote = (jobsArr) => {
    if ($("#remote").value === "All") {
        return filterByEmploymentType(jobsArr)
    } else {
        const filterByRemote = jobsArr.filter(({ remote }) => remote === $("#remote").value)
        if (isEmpty(filterByRemote)) return notFoundJobs()
        else return filterByEmploymentType(filterByRemote)
    }
}

const filterByEmploymentType = (jobsArr) => {
    if ($("#type").value === "All") {
        return orderBy(jobsArr)
    } else {
        const filterByType = jobsArr.filter(({ type }) => type === $("#type").value)
        if (isEmpty(filterByType)) return notFoundJobs()
        else return orderBy(filterByType)
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

const showDropdown = () => {
    if ($(".dropdown-menu").classList.contains("show")) {
        $(".dropdown-menu").classList.remove("show")
    } else {
        $(".dropdown-menu").classList.add("show")
    }

}

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

const scroll = () => {
    if ($("#jobData").classList.contains("show") & window.pageYOffset > 90) {
        $(".menu-icon").style.position = "unset"
        $(".btn-return").style.position = "unset"
    } else if ($("#jobData").classList.contains("show")) {
        $(".menu-icon").style.position = "fixed"
        $(".btn-return").style.position = "fixed"
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
            <div class="card">
                <div class="job-title">
                    <h2>${name}</h2>
                    <a href="#jobData" class="btn-see-job" id="${id}">
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

    const btnSeeJob = $$(".btn-see-job")

    for (const btn of btnSeeJob) {
        btn.addEventListener("click", () => {
            const jobId = btn.id
            $("html").style = "scroll-behavior: unset"
            hideElement(".main-section")
            btnReturnFunctions()
            showElement("#jobData")
            showElement(".job-info")
            hideElement(".delete-container")
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
        <div class="dropdown notVisible">
            <i class="menu-icon btn-right fa-solid fa-ellipsis-vertical"></i>
            <div id="dropdown-menu" class="dropdown-menu">
                <a id="editJob">Edit</a>
                <a id="deleteJob">Delete</a>
            </div>
        </div>
    `
    setBtnReturn()
}

const generateJob = (jobId) => {
    const { company, name, description, location, experience, salary, posted, remote, type, id } = jobId

    $(".dropdown").classList.remove("notVisible")
    $("#editJob").setAttribute("data-id", id)
    $("#deleteJob").setAttribute("data-id", id)

    $(".job-info").innerHTML = `
        <div class="job-title">
            <h2>${name}</h2>
            <p>${company}</p>
            <p>${location} <span>📌</span></p>
            <p class="date">posted ${posted}</p>
        </div>
        <div class="job-description">
            <p>${salary}</p>
            <div class="employment">
                <p>
                    <span class="employment-data">Type:</span> <span>${type}</span>
                </p>
                <p>
                    <span class="employment-data">Remote:</span> <span>${remote ? "Yes" : "No"}</span>
                </p>
                <p>
                    <span class="employment-data">Experience:</span> <span>${experience ? "Needed" : "No needed"}</span>
                </p>
            </div>
            <p>${description}</p>
        </div>
    `

    $(".menu-icon").addEventListener("click", () => showDropdown())

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
    showElement(".delete-container")

    $(".delete-btn").setAttribute("data-id", jobId.id)

    $(".jobName").innerHTML = `${jobId.name}`

    $(".delete-btn").addEventListener("click", () => {
        const id = $(".delete-btn").getAttribute("data-id")
        deleteJob(id)
    })

    $(".cancel-btn").addEventListener("click", () => {
        hideElement(".delete-container")
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
    scroll()
})