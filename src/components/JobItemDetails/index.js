import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {BsFillBriefcaseFill, BsStarFill} from 'react-icons/bs'
import {BiLinkExternal} from 'react-icons/bi'
import {MdLocationOn} from 'react-icons/md'

import Header from '../Header'
import SimilarJobItem from '../SimilarJobItem'
import SkillsCard from '../SkillsCard'

const apiConstantStatus = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class JobItemDetails extends Component {
  state = {
    apiStatus: apiConstantStatus.initial,
    jobData: {},
    similarJobsData: [],
  }

  componentDidMount() {
    this.getJobData()
  }

  getFormattedSimilarData = data => ({
    companyLogoUrl: data.company_logo_url,
    employmentType: data.employment_type,
    id: data.id,
    jobDescription: data.job_description,
    location: data.location,
    rating: data.rating,
    title: data.title,
  })

  getFormattedData = data => ({
    companyLogoUrl: data.company_logo_url,
    companyWebsiteUrl: data.company_website_url,
    employmentType: data.employment_type,
    id: data.id,
    jobDescription: data.job_description,
    lifeAtCompany: {
      description: data.life_at_company.description,
      imageUrl: data.life_at_company.image_url,
    },
    location: data.location,
    title: data.title,
    packagePerAnnum: data.package_per_annum,
    rating: data.rating,
    skills: data.skills.map(eachSkill => ({
      imageUrl: eachSkill.image_url,
      name: eachSkill.name,
    })),
  })

  getJobData = async () => {
    this.setState({apiStatus: apiConstantStatus.inProgress})
    const {match} = this.props
    const {params} = match
    const {id} = params
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/jobs/${id}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    if (response.ok === true) {
      const fetchedData = await response.json()
      const updatedData = this.getFormattedData(fetchedData.job_details)
      const updatedSimilarJobsData = fetchedData.similar_jobs.map(
        eachSimilarJob => this.getFormattedSimilarData(eachSimilarJob),
      )
      this.setState({
        jobData: updatedData,
        similarJobsData: updatedSimilarJobsData,
        apiStatus: apiConstantStatus.success,
      })
    } else {
      this.setState({apiStatus: apiConstantStatus.failure})
    }
  }

  renderLoadingView = () => (
    <div className="job-item-loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderFailureView = () => (
    <div className="job-item-error-view-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
        className="job-item-failure-image"
      />
      <h1 className="job-item-failure-heading-text">
        Oops! Something Went Wrong
      </h1>
      <p className="job-item-failure-description">
        We cannot seem to find the page you are looking for.
      </p>
      <button
        type="button"
        data-testid="button"
        className="job-item-failure-button"
        onClick={this.getJobData}
      >
        Retry
      </button>
    </div>
  )

  renderJobDetailsView = () => {
    const {jobData, similarJobsData} = this.state

    const {
      companyLogoUrl,
      companyWebsiteUrl,
      employmentType,
      jobDescription,
      location,
      title,
      packagePerAnnum,
      rating,
      lifeAtCompany,
      skills,
    } = jobData
    const {description, imageUrl} = lifeAtCompany
    return (
      <div className="job-details-view-container">
        <div className="job-item">
          <div className="logo-title-location-container">
            <div className="logo-title-container">
              <img
                src={companyLogoUrl}
                alt="job details company logo"
                className="company-logo"
              />
              <div className="title-rating-container">
                <h1 className="title-heading">{title}</h1>
                <div className="rating-container">
                  <BsStarFill className="rating-icon" />
                  <p className="rating-heading">{rating}</p>
                </div>
              </div>
            </div>
            <div className="location-package-container">
              <div className="location-employee-container">
                <div className="location-container">
                  <MdLocationOn className="location-icon" />
                  <p className="location-heading">{location}</p>
                </div>
                <div className="employee-type-container">
                  <BsFillBriefcaseFill className="brief-case-icon" />
                  <p className="employee-type-heading">{employmentType}</p>
                </div>
              </div>
              <p className="package-heading">{packagePerAnnum}</p>
            </div>
          </div>
          <hr className="line" />
          <div className="description-visit-container">
            <h1 className="description-heading">Description</h1>
            <div className="visit-container">
              <a href={companyWebsiteUrl} className="visit-heading">
                Visit
              </a>
              <BiLinkExternal className="visit-icon" />
            </div>
          </div>
          <p className="description-text">{jobDescription}</p>
          <h1 className="skills-heading">Skills</h1>
          <ul className="skills-list-container">
            {skills.map(eachSkill => (
              <SkillsCard skillDetails={eachSkill} key={eachSkill.name} />
            ))}
          </ul>
          <h1 className="life-at-company-heading">Life at Company</h1>
          <div className="life-at-company-description-image-container">
            <p className="life-at-company-description">{description}</p>
            <img
              src={imageUrl}
              alt="life at company"
              className="life-at-company-image"
            />
          </div>
        </div>
        <h1 className="similar-jobs-heading">Similar Jobs</h1>
        <ul className="similar-jobs-list">
          {similarJobsData.map(eachSimilarJob => (
            <SimilarJobItem
              jobDetails={eachSimilarJob}
              key={eachSimilarJob.id}
            />
          ))}
        </ul>
      </div>
    )
  }

  renderJobDetails = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiConstantStatus.success:
        return this.renderJobDetailsView()
      case apiConstantStatus.failure:
        return this.renderFailureView()
      case apiConstantStatus.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="job-item-details-container">
          {this.renderJobDetails()}
        </div>
      </>
    )
  }
}

export default JobItemDetails
