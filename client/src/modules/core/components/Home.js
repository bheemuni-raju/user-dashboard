import React from 'react'
import PropTypes from 'prop-types'

const Home = ({match}) =>
  <section className="content-header"
    style={{
      height: '83vh'
    }}>
    <div className="row text-center">
      Logged in successfully!
    </div>
  </section>

Home.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string
  }).isRequired
}

export default Home
