import moment from 'moment-timezone'
import React, { Component, useEffect, useState } from 'react'
import abpUserConfigurationService from '@services/abpUserConfigurationService'
import Utils from '@utils/utils'
// import * as moment from 'moment'
import Exception from '@scenes/common/Exception'
import { themeByEvent, AppConfiguration } from '@lib/appconst'
import { changeBackgroundByEvent, getCountDownXmasMessage } from '@lib/helper'
import { L } from '@lib/abpUtility'

// Export function để refresh ABP configuration sau khi login
export const refreshAbpConfiguration = async () => {
  try {
    const data = await abpUserConfigurationService.getAll()

    if (data) {
      // Backup current session data để không mất
      const currentSession = abp.session

      // Update abp configuration
      Utils.extend(true, abp, data.data.result)

      // Restore session data nếu có
      if (currentSession) {
        abp.session = { ...abp.session, ...currentSession }
      }

      abp.clock.provider = Utils.getCurrentClockProvider(data.data.result.clock.provider)
      moment.locale(abp.localization.currentLanguage.name)

      if (abp.clock.provider.supportsMultipleTimezone) {
        moment.tz.setDefault(abp.timing.timeZoneInfo.iana.timeZoneId)
      }
    }
  } catch (error) {
    console.error('Error refreshing ABP configuration:', error)
  }
}

const splashScreens = themeByEvent.events

interface LoadingSplashScreenProps {
  goNext?: () => void
  destroyTime?: number
  loaderType?: string
  loaderMessage?: string
}
const LoadingSplashScreen: React.FC<LoadingSplashScreenProps> = ({
  goNext,
  destroyTime,
  loaderType,
  loaderMessage
}) => {
  const [redirectAfter, setRedirectAfter] = useState((destroyTime || 0) / 1000)

  useEffect(() => {
    const timer = setTimeout(() => {
      redirectAfter > 0 && setRedirectAfter(redirectAfter - 1)
    }, 1000)
    // Clear timeout if the component is unmounted
    return () => clearTimeout(timer)
  })

  return (
    <div id="splash-screen" className="app-splash-screen">
      {(!loaderType || loaderType === splashScreens.default) && (
        <div id="splash-default">
          <div className="wrap-loading">
            Wait a moment while we load your app.
            <div className="loading-dot">.</div>
          </div>
        </div>
      )}

      {loaderType === splashScreens.xmasSanta && (
        <div id="splash-xmas-santa" className="splash-xmas">
          <div className="window">
            <div className="santa">
              <div className="head">
                <div className="face">
                  <div className="redhat">
                    <div className="whitepart"></div>
                    <div className="redpart"></div>
                    <div className="hatball"></div>
                  </div>
                  <div className="eyes"></div>
                  <div className="beard">
                    <div className="nouse"></div>
                    <div className="mouth"></div>
                  </div>
                </div>
                <div className="ears"></div>
              </div>
              <div className="body"></div>
            </div>
          </div>
          <div className="message">
            <h1>{loaderMessage}</h1>
          </div>
        </div>
      )}

      {loaderType === splashScreens.xmasNight && (
        <div id="splash-xmas-night" className="splash-xmas">
          <div id="christmas">
            <div className="flake large f-1"></div>
            <div className="flake large f-2"></div>
            <div className="flake large f-3"></div>
            <div className="flake large f-4"></div>
            <div className="flake large f-5"></div>
            <div className="flake large f-6"></div>
            <div className="flake large f-7"></div>
            <div className="flake large f-8"></div>
            <div className="flake large f-9"></div>
            <div className="flake large f-10"></div>
            <div className="flake large f-11"></div>
            <div className="flake large f-12"></div>
            <div className="flake large f-13"></div>
            <div className="flake large f-14"></div>
            <div className="flake large f-15"></div>
            <div className="flake large f-16"></div>
            <div className="flake large f-17"></div>
            <div className="flake f-18"></div>
            <div className="flake f-19"></div>
            <div className="flake f-20"></div>
            <div className="flake f-21"></div>
            <div className="flake f-22"></div>
            <div className="flake f-23"></div>
            <div className="flake f-24"></div>
            <div className="flake f-25"></div>
            <div className="flake f-26"></div>
            <div className="flake f-27"></div>
            <div className="flake f-28"></div>
            <div className="flake f-29"></div>
            <div className="flake f-30"></div>
            <div className="flake f-31"></div>
            <div className="tree left">
              <div className="snow"></div>
            </div>
            <div className="tree right">
              <div className="snow"></div>
            </div>
            <div className="ground"></div>
          </div>
          <div className="message">
            <h1>{loaderMessage}</h1>
          </div>
        </div>
      )}

      {loaderType === splashScreens.xmasHouse && (
        <div id="splash-xmas-house" className="splash-xmas">
          <div style={{ paddingTop: '100px' }} className="fond">
            <div className="contener_home_one">
              <div className="fireplace">&nbsp;</div>
              <div className="fireplace_top">&nbsp;</div>
              <div className="triangle">&nbsp;</div>
              <div className="parallelogram">&nbsp;</div>
              <div className="door">&nbsp;</div>
              <div className="window_one">&nbsp;</div>
              <div className="window_two">&nbsp;</div>
              <div className="home_base">&nbsp;</div>
              <div className="christmas_tree"></div>
              <div className="christmas_tree" style={{ left: '-140px' }}></div>
              <div className="mountain_one">
                <div className="sub_mountain_one">&nbsp;</div>
              </div>
              <div className="mountain_two">
                <div className="sub_mountain_two">&nbsp;</div>
              </div>
              <div className="lutz">
                <div className="lutin_pom">&nbsp;</div>
                <div className="lutin_top">&nbsp;</div>
                <div className="lutin_head">&nbsp;</div>
                <div className="lutin_arm1">&nbsp;</div>
                <div className="lutin_arm2">&nbsp;</div>
                <div className="lutin_body">&nbsp;</div>
                <div className="lutin_jb1">&nbsp;</div>
                <div className="lutin_jb2">&nbsp;</div>
              </div>
            </div>
            <div className="contener_snow">
              <div className="snowflakes">
                <div className="snowflake">&nbsp;</div>
                <div className="snowflake">&nbsp;</div>
                <div className="snowflake">&nbsp;</div>
                <div className="snowflake">&nbsp;</div>
                <div className="snowflake">&nbsp;</div>
                <div className="snowflake">&nbsp;</div>
                <div className="snowflake">&nbsp;</div>
                <div className="snowflake">&nbsp;</div>
              </div>
            </div>
            <div
              style={{
                width: '500px',
                height: '9px',
                backgroundColor: '#ffffff',
                borderRadius: '5px'
              }}>
              &nbsp;
            </div>
          </div>
          <div className="message">
            <h1>{loaderMessage}</h1>
          </div>
        </div>
      )}

      {loaderType === splashScreens.flowers && (
        <div id="flowers">
          <svg className="flower" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 59.71 58.03">
            <title>Asset 1</title>
            <g id="Layer_2" data-name="Layer 2">
              <g id="OBJECTS">
                <path
                  className="cls-1"
                  d="M59.28,30.86A14.53,14.53,0,0,0,49,13.18a13.86,13.86,0,0,0-2.83-.39A14.09,14.09,0,0,0,19.31,8.15a14,14,0,0,0-1.59-.5A14.39,14.39,0,0,0,.43,18.48,14.79,14.79,0,0,0,4.56,32.75,15.13,15.13,0,0,0,3.36,36,14.52,14.52,0,0,0,13.69,53.65a13.89,13.89,0,0,0,11-1.95,14,14,0,0,0,8.31,5.92A14.39,14.39,0,0,0,50.34,46.78,15.1,15.1,0,0,0,50.61,41,14.72,14.72,0,0,0,59.28,30.86Z"></path>
                <path
                  className="cls-2"
                  d="M39.38,22.42a1.67,1.67,0,0,0,1.21.5,1.75,1.75,0,0,0,1.71-1.77,1.72,1.72,0,0,0-1.71-1.74,1.76,1.76,0,0,0-1.7,1.78,1.61,1.61,0,0,0,.09.54L32.3,26a2.8,2.8,0,0,0-.84-.6l1.29-5.23A1.72,1.72,0,0,0,34,19.67a1.79,1.79,0,0,0,0-2.49,1.68,1.68,0,0,0-2.41,0,1.79,1.79,0,0,0,0,2.48A1.6,1.6,0,0,0,32,20l-1.29,5.2a2.69,2.69,0,0,0-.85,0l-2.79-7.61a1.79,1.79,0,0,0,.73-1.14,1.7,1.7,0,1,0-2,1.42,1.57,1.57,0,0,0,.53,0l2.78,7.57a2.8,2.8,0,0,0-1,.85l-3.5-3a1.89,1.89,0,0,0,0-1.44,2.11,2.11,0,0,0-2.43-1.33,1.67,1.67,0,0,0-1,2.3,2.13,2.13,0,0,0,2.43,1.34,1.74,1.74,0,0,0,.49-.25L27.67,27a3.24,3.24,0,0,0-.16.53c0,.11,0,.21,0,.31L19.33,27a1.78,1.78,0,0,0-.65-1.16,1.68,1.68,0,0,0-2.39.35,1.79,1.79,0,0,0,.31,2.46A1.68,1.68,0,0,0,19,28.33a1.75,1.75,0,0,0,.25-.49l8.28.81c0,.05,0,.1,0,.16l-3.68,2.63A1.64,1.64,0,0,0,22.64,31,1.76,1.76,0,0,0,21,32.85a1.71,1.71,0,0,0,1.79,1.65,1.76,1.76,0,0,0,1.62-1.86,1.93,1.93,0,0,0-.12-.54l3.57-2.54a2.71,2.71,0,0,0,1,1L27,37.28a1.71,1.71,0,0,0-1.24.48,1.79,1.79,0,0,0-.09,2.48,1.68,1.68,0,0,0,2.41.07,1.79,1.79,0,0,0,.09-2.48,1.65,1.65,0,0,0-.42-.33l1.83-6.66a.37.37,0,0,0,.14,0,2.57,2.57,0,0,0,1.07,0l.92,3.87A1.77,1.77,0,0,0,32,38a1.7,1.7,0,0,0,2.14-1.16A1.74,1.74,0,0,0,33,34.61a1.65,1.65,0,0,0-.53-.07l-.94-4a2.63,2.63,0,0,0,.66-.49l5.87,4.39a1.8,1.8,0,0,0,0,1.35,1.66,1.66,0,0,0,2.22.93,1.78,1.78,0,0,0,.93-2.29A1.66,1.66,0,0,0,39,33.53a1.54,1.54,0,0,0-.45.3L32.7,29.44a3,3,0,0,0,.33-.89,2.46,2.46,0,0,0,0-.37l4.74.7a1.7,1.7,0,0,0,.6,1.2,1.68,1.68,0,0,0,2.4-.24,1.79,1.79,0,0,0-.21-2.47,1.67,1.67,0,0,0-2.4.24,1.69,1.69,0,0,0-.27.47L33,27.36a2.73,2.73,0,0,0-.26-.69Z"></path>
              </g>
            </g>
          </svg>
          <svg className="flower" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 59.71 58.03">
            <title>Asset 1</title>
            <g id="Layer_2" data-name="Layer 2">
              <g id="OBJECTS">
                <path
                  className="cls-1"
                  d="M59.28,30.86A14.53,14.53,0,0,0,49,13.18a13.86,13.86,0,0,0-2.83-.39A14.09,14.09,0,0,0,19.31,8.15a14,14,0,0,0-1.59-.5A14.39,14.39,0,0,0,.43,18.48,14.79,14.79,0,0,0,4.56,32.75,15.13,15.13,0,0,0,3.36,36,14.52,14.52,0,0,0,13.69,53.65a13.89,13.89,0,0,0,11-1.95,14,14,0,0,0,8.31,5.92A14.39,14.39,0,0,0,50.34,46.78,15.1,15.1,0,0,0,50.61,41,14.72,14.72,0,0,0,59.28,30.86Z"></path>
                <path
                  className="cls-2"
                  d="M39.38,22.42a1.67,1.67,0,0,0,1.21.5,1.75,1.75,0,0,0,1.71-1.77,1.72,1.72,0,0,0-1.71-1.74,1.76,1.76,0,0,0-1.7,1.78,1.61,1.61,0,0,0,.09.54L32.3,26a2.8,2.8,0,0,0-.84-.6l1.29-5.23A1.72,1.72,0,0,0,34,19.67a1.79,1.79,0,0,0,0-2.49,1.68,1.68,0,0,0-2.41,0,1.79,1.79,0,0,0,0,2.48A1.6,1.6,0,0,0,32,20l-1.29,5.2a2.69,2.69,0,0,0-.85,0l-2.79-7.61a1.79,1.79,0,0,0,.73-1.14,1.7,1.7,0,1,0-2,1.42,1.57,1.57,0,0,0,.53,0l2.78,7.57a2.8,2.8,0,0,0-1,.85l-3.5-3a1.89,1.89,0,0,0,0-1.44,2.11,2.11,0,0,0-2.43-1.33,1.67,1.67,0,0,0-1,2.3,2.13,2.13,0,0,0,2.43,1.34,1.74,1.74,0,0,0,.49-.25L27.67,27a3.24,3.24,0,0,0-.16.53c0,.11,0,.21,0,.31L19.33,27a1.78,1.78,0,0,0-.65-1.16,1.68,1.68,0,0,0-2.39.35,1.79,1.79,0,0,0,.31,2.46A1.68,1.68,0,0,0,19,28.33a1.75,1.75,0,0,0,.25-.49l8.28.81c0,.05,0,.1,0,.16l-3.68,2.63A1.64,1.64,0,0,0,22.64,31,1.76,1.76,0,0,0,21,32.85a1.71,1.71,0,0,0,1.79,1.65,1.76,1.76,0,0,0,1.62-1.86,1.93,1.93,0,0,0-.12-.54l3.57-2.54a2.71,2.71,0,0,0,1,1L27,37.28a1.71,1.71,0,0,0-1.24.48,1.79,1.79,0,0,0-.09,2.48,1.68,1.68,0,0,0,2.41.07,1.79,1.79,0,0,0,.09-2.48,1.65,1.65,0,0,0-.42-.33l1.83-6.66a.37.37,0,0,0,.14,0,2.57,2.57,0,0,0,1.07,0l.92,3.87A1.77,1.77,0,0,0,32,38a1.7,1.7,0,0,0,2.14-1.16A1.74,1.74,0,0,0,33,34.61a1.65,1.65,0,0,0-.53-.07l-.94-4a2.63,2.63,0,0,0,.66-.49l5.87,4.39a1.8,1.8,0,0,0,0,1.35,1.66,1.66,0,0,0,2.22.93,1.78,1.78,0,0,0,.93-2.29A1.66,1.66,0,0,0,39,33.53a1.54,1.54,0,0,0-.45.3L32.7,29.44a3,3,0,0,0,.33-.89,2.46,2.46,0,0,0,0-.37l4.74.7a1.7,1.7,0,0,0,.6,1.2,1.68,1.68,0,0,0,2.4-.24,1.79,1.79,0,0,0-.21-2.47,1.67,1.67,0,0,0-2.4.24,1.69,1.69,0,0,0-.27.47L33,27.36a2.73,2.73,0,0,0-.26-.69Z"></path>
              </g>
            </g>
          </svg>
          <svg className="flower" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 59.71 58.03">
            <title>Asset 1</title>
            <g id="Layer_2" data-name="Layer 2">
              <g id="OBJECTS">
                <path
                  className="cls-1"
                  d="M59.28,30.86A14.53,14.53,0,0,0,49,13.18a13.86,13.86,0,0,0-2.83-.39A14.09,14.09,0,0,0,19.31,8.15a14,14,0,0,0-1.59-.5A14.39,14.39,0,0,0,.43,18.48,14.79,14.79,0,0,0,4.56,32.75,15.13,15.13,0,0,0,3.36,36,14.52,14.52,0,0,0,13.69,53.65a13.89,13.89,0,0,0,11-1.95,14,14,0,0,0,8.31,5.92A14.39,14.39,0,0,0,50.34,46.78,15.1,15.1,0,0,0,50.61,41,14.72,14.72,0,0,0,59.28,30.86Z"></path>
                <path
                  className="cls-2"
                  d="M39.38,22.42a1.67,1.67,0,0,0,1.21.5,1.75,1.75,0,0,0,1.71-1.77,1.72,1.72,0,0,0-1.71-1.74,1.76,1.76,0,0,0-1.7,1.78,1.61,1.61,0,0,0,.09.54L32.3,26a2.8,2.8,0,0,0-.84-.6l1.29-5.23A1.72,1.72,0,0,0,34,19.67a1.79,1.79,0,0,0,0-2.49,1.68,1.68,0,0,0-2.41,0,1.79,1.79,0,0,0,0,2.48A1.6,1.6,0,0,0,32,20l-1.29,5.2a2.69,2.69,0,0,0-.85,0l-2.79-7.61a1.79,1.79,0,0,0,.73-1.14,1.7,1.7,0,1,0-2,1.42,1.57,1.57,0,0,0,.53,0l2.78,7.57a2.8,2.8,0,0,0-1,.85l-3.5-3a1.89,1.89,0,0,0,0-1.44,2.11,2.11,0,0,0-2.43-1.33,1.67,1.67,0,0,0-1,2.3,2.13,2.13,0,0,0,2.43,1.34,1.74,1.74,0,0,0,.49-.25L27.67,27a3.24,3.24,0,0,0-.16.53c0,.11,0,.21,0,.31L19.33,27a1.78,1.78,0,0,0-.65-1.16,1.68,1.68,0,0,0-2.39.35,1.79,1.79,0,0,0,.31,2.46A1.68,1.68,0,0,0,19,28.33a1.75,1.75,0,0,0,.25-.49l8.28.81c0,.05,0,.1,0,.16l-3.68,2.63A1.64,1.64,0,0,0,22.64,31,1.76,1.76,0,0,0,21,32.85a1.71,1.71,0,0,0,1.79,1.65,1.76,1.76,0,0,0,1.62-1.86,1.93,1.93,0,0,0-.12-.54l3.57-2.54a2.71,2.71,0,0,0,1,1L27,37.28a1.71,1.71,0,0,0-1.24.48,1.79,1.79,0,0,0-.09,2.48,1.68,1.68,0,0,0,2.41.07,1.79,1.79,0,0,0,.09-2.48,1.65,1.65,0,0,0-.42-.33l1.83-6.66a.37.37,0,0,0,.14,0,2.57,2.57,0,0,0,1.07,0l.92,3.87A1.77,1.77,0,0,0,32,38a1.7,1.7,0,0,0,2.14-1.16A1.74,1.74,0,0,0,33,34.61a1.65,1.65,0,0,0-.53-.07l-.94-4a2.63,2.63,0,0,0,.66-.49l5.87,4.39a1.8,1.8,0,0,0,0,1.35,1.66,1.66,0,0,0,2.22.93,1.78,1.78,0,0,0,.93-2.29A1.66,1.66,0,0,0,39,33.53a1.54,1.54,0,0,0-.45.3L32.7,29.44a3,3,0,0,0,.33-.89,2.46,2.46,0,0,0,0-.37l4.74.7a1.7,1.7,0,0,0,.6,1.2,1.68,1.68,0,0,0,2.4-.24,1.79,1.79,0,0,0-.21-2.47,1.67,1.67,0,0,0-2.4.24,1.69,1.69,0,0,0-.27.47L33,27.36a2.73,2.73,0,0,0-.26-.69Z"></path>
              </g>
            </g>
          </svg>
          <svg className="flower" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 59.71 58.03">
            <title>Asset 1</title>
            <g id="Layer_2" data-name="Layer 2">
              <g id="OBJECTS">
                <path
                  className="cls-1"
                  d="M59.28,30.86A14.53,14.53,0,0,0,49,13.18a13.86,13.86,0,0,0-2.83-.39A14.09,14.09,0,0,0,19.31,8.15a14,14,0,0,0-1.59-.5A14.39,14.39,0,0,0,.43,18.48,14.79,14.79,0,0,0,4.56,32.75,15.13,15.13,0,0,0,3.36,36,14.52,14.52,0,0,0,13.69,53.65a13.89,13.89,0,0,0,11-1.95,14,14,0,0,0,8.31,5.92A14.39,14.39,0,0,0,50.34,46.78,15.1,15.1,0,0,0,50.61,41,14.72,14.72,0,0,0,59.28,30.86Z"></path>
                <path
                  className="cls-2"
                  d="M39.38,22.42a1.67,1.67,0,0,0,1.21.5,1.75,1.75,0,0,0,1.71-1.77,1.72,1.72,0,0,0-1.71-1.74,1.76,1.76,0,0,0-1.7,1.78,1.61,1.61,0,0,0,.09.54L32.3,26a2.8,2.8,0,0,0-.84-.6l1.29-5.23A1.72,1.72,0,0,0,34,19.67a1.79,1.79,0,0,0,0-2.49,1.68,1.68,0,0,0-2.41,0,1.79,1.79,0,0,0,0,2.48A1.6,1.6,0,0,0,32,20l-1.29,5.2a2.69,2.69,0,0,0-.85,0l-2.79-7.61a1.79,1.79,0,0,0,.73-1.14,1.7,1.7,0,1,0-2,1.42,1.57,1.57,0,0,0,.53,0l2.78,7.57a2.8,2.8,0,0,0-1,.85l-3.5-3a1.89,1.89,0,0,0,0-1.44,2.11,2.11,0,0,0-2.43-1.33,1.67,1.67,0,0,0-1,2.3,2.13,2.13,0,0,0,2.43,1.34,1.74,1.74,0,0,0,.49-.25L27.67,27a3.24,3.24,0,0,0-.16.53c0,.11,0,.21,0,.31L19.33,27a1.78,1.78,0,0,0-.65-1.16,1.68,1.68,0,0,0-2.39.35,1.79,1.79,0,0,0,.31,2.46A1.68,1.68,0,0,0,19,28.33a1.75,1.75,0,0,0,.25-.49l8.28.81c0,.05,0,.1,0,.16l-3.68,2.63A1.64,1.64,0,0,0,22.64,31,1.76,1.76,0,0,0,21,32.85a1.71,1.71,0,0,0,1.79,1.65,1.76,1.76,0,0,0,1.62-1.86,1.93,1.93,0,0,0-.12-.54l3.57-2.54a2.71,2.71,0,0,0,1,1L27,37.28a1.71,1.71,0,0,0-1.24.48,1.79,1.79,0,0,0-.09,2.48,1.68,1.68,0,0,0,2.41.07,1.79,1.79,0,0,0,.09-2.48,1.65,1.65,0,0,0-.42-.33l1.83-6.66a.37.37,0,0,0,.14,0,2.57,2.57,0,0,0,1.07,0l.92,3.87A1.77,1.77,0,0,0,32,38a1.7,1.7,0,0,0,2.14-1.16A1.74,1.74,0,0,0,33,34.61a1.65,1.65,0,0,0-.53-.07l-.94-4a2.63,2.63,0,0,0,.66-.49l5.87,4.39a1.8,1.8,0,0,0,0,1.35,1.66,1.66,0,0,0,2.22.93,1.78,1.78,0,0,0,.93-2.29A1.66,1.66,0,0,0,39,33.53a1.54,1.54,0,0,0-.45.3L32.7,29.44a3,3,0,0,0,.33-.89,2.46,2.46,0,0,0,0-.37l4.74.7a1.7,1.7,0,0,0,.6,1.2,1.68,1.68,0,0,0,2.4-.24,1.79,1.79,0,0,0-.21-2.47,1.67,1.67,0,0,0-2.4.24,1.69,1.69,0,0,0-.27.47L33,27.36a2.73,2.73,0,0,0-.26-.69Z"></path>
              </g>
            </g>
          </svg>
          <svg className="flower" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 59.71 58.03">
            <title>Asset 1</title>
            <g id="Layer_2" data-name="Layer 2">
              <g id="OBJECTS">
                <path
                  className="cls-1"
                  d="M59.28,30.86A14.53,14.53,0,0,0,49,13.18a13.86,13.86,0,0,0-2.83-.39A14.09,14.09,0,0,0,19.31,8.15a14,14,0,0,0-1.59-.5A14.39,14.39,0,0,0,.43,18.48,14.79,14.79,0,0,0,4.56,32.75,15.13,15.13,0,0,0,3.36,36,14.52,14.52,0,0,0,13.69,53.65a13.89,13.89,0,0,0,11-1.95,14,14,0,0,0,8.31,5.92A14.39,14.39,0,0,0,50.34,46.78,15.1,15.1,0,0,0,50.61,41,14.72,14.72,0,0,0,59.28,30.86Z"></path>
                <path
                  className="cls-2"
                  d="M39.38,22.42a1.67,1.67,0,0,0,1.21.5,1.75,1.75,0,0,0,1.71-1.77,1.72,1.72,0,0,0-1.71-1.74,1.76,1.76,0,0,0-1.7,1.78,1.61,1.61,0,0,0,.09.54L32.3,26a2.8,2.8,0,0,0-.84-.6l1.29-5.23A1.72,1.72,0,0,0,34,19.67a1.79,1.79,0,0,0,0-2.49,1.68,1.68,0,0,0-2.41,0,1.79,1.79,0,0,0,0,2.48A1.6,1.6,0,0,0,32,20l-1.29,5.2a2.69,2.69,0,0,0-.85,0l-2.79-7.61a1.79,1.79,0,0,0,.73-1.14,1.7,1.7,0,1,0-2,1.42,1.57,1.57,0,0,0,.53,0l2.78,7.57a2.8,2.8,0,0,0-1,.85l-3.5-3a1.89,1.89,0,0,0,0-1.44,2.11,2.11,0,0,0-2.43-1.33,1.67,1.67,0,0,0-1,2.3,2.13,2.13,0,0,0,2.43,1.34,1.74,1.74,0,0,0,.49-.25L27.67,27a3.24,3.24,0,0,0-.16.53c0,.11,0,.21,0,.31L19.33,27a1.78,1.78,0,0,0-.65-1.16,1.68,1.68,0,0,0-2.39.35,1.79,1.79,0,0,0,.31,2.46A1.68,1.68,0,0,0,19,28.33a1.75,1.75,0,0,0,.25-.49l8.28.81c0,.05,0,.1,0,.16l-3.68,2.63A1.64,1.64,0,0,0,22.64,31,1.76,1.76,0,0,0,21,32.85a1.71,1.71,0,0,0,1.79,1.65,1.76,1.76,0,0,0,1.62-1.86,1.93,1.93,0,0,0-.12-.54l3.57-2.54a2.71,2.71,0,0,0,1,1L27,37.28a1.71,1.71,0,0,0-1.24.48,1.79,1.79,0,0,0-.09,2.48,1.68,1.68,0,0,0,2.41.07,1.79,1.79,0,0,0,.09-2.48,1.65,1.65,0,0,0-.42-.33l1.83-6.66a.37.37,0,0,0,.14,0,2.57,2.57,0,0,0,1.07,0l.92,3.87A1.77,1.77,0,0,0,32,38a1.7,1.7,0,0,0,2.14-1.16A1.74,1.74,0,0,0,33,34.61a1.65,1.65,0,0,0-.53-.07l-.94-4a2.63,2.63,0,0,0,.66-.49l5.87,4.39a1.8,1.8,0,0,0,0,1.35,1.66,1.66,0,0,0,2.22.93,1.78,1.78,0,0,0,.93-2.29A1.66,1.66,0,0,0,39,33.53a1.54,1.54,0,0,0-.45.3L32.7,29.44a3,3,0,0,0,.33-.89,2.46,2.46,0,0,0,0-.37l4.74.7a1.7,1.7,0,0,0,.6,1.2,1.68,1.68,0,0,0,2.4-.24,1.79,1.79,0,0,0-.21-2.47,1.67,1.67,0,0,0-2.4.24,1.69,1.69,0,0,0-.27.47L33,27.36a2.73,2.73,0,0,0-.26-.69Z"></path>
              </g>
            </g>
          </svg>
          <svg className="flower" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 59.71 58.03">
            <title>Asset 1</title>
            <g id="Layer_2" data-name="Layer 2">
              <g id="OBJECTS">
                <path
                  className="cls-1"
                  d="M59.28,30.86A14.53,14.53,0,0,0,49,13.18a13.86,13.86,0,0,0-2.83-.39A14.09,14.09,0,0,0,19.31,8.15a14,14,0,0,0-1.59-.5A14.39,14.39,0,0,0,.43,18.48,14.79,14.79,0,0,0,4.56,32.75,15.13,15.13,0,0,0,3.36,36,14.52,14.52,0,0,0,13.69,53.65a13.89,13.89,0,0,0,11-1.95,14,14,0,0,0,8.31,5.92A14.39,14.39,0,0,0,50.34,46.78,15.1,15.1,0,0,0,50.61,41,14.72,14.72,0,0,0,59.28,30.86Z"></path>
                <path
                  className="cls-2"
                  d="M39.38,22.42a1.67,1.67,0,0,0,1.21.5,1.75,1.75,0,0,0,1.71-1.77,1.72,1.72,0,0,0-1.71-1.74,1.76,1.76,0,0,0-1.7,1.78,1.61,1.61,0,0,0,.09.54L32.3,26a2.8,2.8,0,0,0-.84-.6l1.29-5.23A1.72,1.72,0,0,0,34,19.67a1.79,1.79,0,0,0,0-2.49,1.68,1.68,0,0,0-2.41,0,1.79,1.79,0,0,0,0,2.48A1.6,1.6,0,0,0,32,20l-1.29,5.2a2.69,2.69,0,0,0-.85,0l-2.79-7.61a1.79,1.79,0,0,0,.73-1.14,1.7,1.7,0,1,0-2,1.42,1.57,1.57,0,0,0,.53,0l2.78,7.57a2.8,2.8,0,0,0-1,.85l-3.5-3a1.89,1.89,0,0,0,0-1.44,2.11,2.11,0,0,0-2.43-1.33,1.67,1.67,0,0,0-1,2.3,2.13,2.13,0,0,0,2.43,1.34,1.74,1.74,0,0,0,.49-.25L27.67,27a3.24,3.24,0,0,0-.16.53c0,.11,0,.21,0,.31L19.33,27a1.78,1.78,0,0,0-.65-1.16,1.68,1.68,0,0,0-2.39.35,1.79,1.79,0,0,0,.31,2.46A1.68,1.68,0,0,0,19,28.33a1.75,1.75,0,0,0,.25-.49l8.28.81c0,.05,0,.1,0,.16l-3.68,2.63A1.64,1.64,0,0,0,22.64,31,1.76,1.76,0,0,0,21,32.85a1.71,1.71,0,0,0,1.79,1.65,1.76,1.76,0,0,0,1.62-1.86,1.93,1.93,0,0,0-.12-.54l3.57-2.54a2.71,2.71,0,0,0,1,1L27,37.28a1.71,1.71,0,0,0-1.24.48,1.79,1.79,0,0,0-.09,2.48,1.68,1.68,0,0,0,2.41.07,1.79,1.79,0,0,0,.09-2.48,1.65,1.65,0,0,0-.42-.33l1.83-6.66a.37.37,0,0,0,.14,0,2.57,2.57,0,0,0,1.07,0l.92,3.87A1.77,1.77,0,0,0,32,38a1.7,1.7,0,0,0,2.14-1.16A1.74,1.74,0,0,0,33,34.61a1.65,1.65,0,0,0-.53-.07l-.94-4a2.63,2.63,0,0,0,.66-.49l5.87,4.39a1.8,1.8,0,0,0,0,1.35,1.66,1.66,0,0,0,2.22.93,1.78,1.78,0,0,0,.93-2.29A1.66,1.66,0,0,0,39,33.53a1.54,1.54,0,0,0-.45.3L32.7,29.44a3,3,0,0,0,.33-.89,2.46,2.46,0,0,0,0-.37l4.74.7a1.7,1.7,0,0,0,.6,1.2,1.68,1.68,0,0,0,2.4-.24,1.79,1.79,0,0,0-.21-2.47,1.67,1.67,0,0,0-2.4.24,1.69,1.69,0,0,0-.27.47L33,27.36a2.73,2.73,0,0,0-.26-.69Z"></path>
              </g>
            </g>
          </svg>
          <svg className="flower" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 59.71 58.03">
            <title>Asset 1</title>
            <g id="Layer_2" data-name="Layer 2">
              <g id="OBJECTS">
                <path
                  className="cls-1"
                  d="M59.28,30.86A14.53,14.53,0,0,0,49,13.18a13.86,13.86,0,0,0-2.83-.39A14.09,14.09,0,0,0,19.31,8.15a14,14,0,0,0-1.59-.5A14.39,14.39,0,0,0,.43,18.48,14.79,14.79,0,0,0,4.56,32.75,15.13,15.13,0,0,0,3.36,36,14.52,14.52,0,0,0,13.69,53.65a13.89,13.89,0,0,0,11-1.95,14,14,0,0,0,8.31,5.92A14.39,14.39,0,0,0,50.34,46.78,15.1,15.1,0,0,0,50.61,41,14.72,14.72,0,0,0,59.28,30.86Z"></path>
                <path
                  className="cls-2"
                  d="M39.38,22.42a1.67,1.67,0,0,0,1.21.5,1.75,1.75,0,0,0,1.71-1.77,1.72,1.72,0,0,0-1.71-1.74,1.76,1.76,0,0,0-1.7,1.78,1.61,1.61,0,0,0,.09.54L32.3,26a2.8,2.8,0,0,0-.84-.6l1.29-5.23A1.72,1.72,0,0,0,34,19.67a1.79,1.79,0,0,0,0-2.49,1.68,1.68,0,0,0-2.41,0,1.79,1.79,0,0,0,0,2.48A1.6,1.6,0,0,0,32,20l-1.29,5.2a2.69,2.69,0,0,0-.85,0l-2.79-7.61a1.79,1.79,0,0,0,.73-1.14,1.7,1.7,0,1,0-2,1.42,1.57,1.57,0,0,0,.53,0l2.78,7.57a2.8,2.8,0,0,0-1,.85l-3.5-3a1.89,1.89,0,0,0,0-1.44,2.11,2.11,0,0,0-2.43-1.33,1.67,1.67,0,0,0-1,2.3,2.13,2.13,0,0,0,2.43,1.34,1.74,1.74,0,0,0,.49-.25L27.67,27a3.24,3.24,0,0,0-.16.53c0,.11,0,.21,0,.31L19.33,27a1.78,1.78,0,0,0-.65-1.16,1.68,1.68,0,0,0-2.39.35,1.79,1.79,0,0,0,.31,2.46A1.68,1.68,0,0,0,19,28.33a1.75,1.75,0,0,0,.25-.49l8.28.81c0,.05,0,.1,0,.16l-3.68,2.63A1.64,1.64,0,0,0,22.64,31,1.76,1.76,0,0,0,21,32.85a1.71,1.71,0,0,0,1.79,1.65,1.76,1.76,0,0,0,1.62-1.86,1.93,1.93,0,0,0-.12-.54l3.57-2.54a2.71,2.71,0,0,0,1,1L27,37.28a1.71,1.71,0,0,0-1.24.48,1.79,1.79,0,0,0-.09,2.48,1.68,1.68,0,0,0,2.41.07,1.79,1.79,0,0,0,.09-2.48,1.65,1.65,0,0,0-.42-.33l1.83-6.66a.37.37,0,0,0,.14,0,2.57,2.57,0,0,0,1.07,0l.92,3.87A1.77,1.77,0,0,0,32,38a1.7,1.7,0,0,0,2.14-1.16A1.74,1.74,0,0,0,33,34.61a1.65,1.65,0,0,0-.53-.07l-.94-4a2.63,2.63,0,0,0,.66-.49l5.87,4.39a1.8,1.8,0,0,0,0,1.35,1.66,1.66,0,0,0,2.22.93,1.78,1.78,0,0,0,.93-2.29A1.66,1.66,0,0,0,39,33.53a1.54,1.54,0,0,0-.45.3L32.7,29.44a3,3,0,0,0,.33-.89,2.46,2.46,0,0,0,0-.37l4.74.7a1.7,1.7,0,0,0,.6,1.2,1.68,1.68,0,0,0,2.4-.24,1.79,1.79,0,0,0-.21-2.47,1.67,1.67,0,0,0-2.4.24,1.69,1.69,0,0,0-.27.47L33,27.36a2.73,2.73,0,0,0-.26-.69Z"></path>
              </g>
            </g>
          </svg>
        </div>
      )}

      {redirectAfter > 0 && (
        <div className="next-button">
          <div className="wrap-button">
            {/*<a className="button" onClick={goNext}>{L('BTN_SPLASH_SCREEN_ACCESS')}</a>*/}
            <div className="small" style={{ marginTop: '5px' }}>
              {L('SPLASH_SCREEN_AUTO_REDIRECT_AFTER_{0}', redirectAfter)}
              {goNext && (
                <span className="btn-access pointer" onClick={goNext}>
                  {' '}
                  <b>{L('BTN_SPLASH_SCREEN_ACCESS')}</b>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function withSplashScreen(WrappedComponent) {
  return class a extends Component {
    state = {
      loading: true,
      loaderType: '',
      loaderMessage: '',
      error: null
    }

    componentDidMount = async () => {
      try {
        const data = await abpUserConfigurationService.getAll()

        // Init abp
        if (data) {
          Utils.extend(true, abp, data.data.result)
          abp.clock.provider = Utils.getCurrentClockProvider(data.data.result.clock.provider)

          moment.locale(abp.localization.currentLanguage.name)

          if (abp.clock.provider.supportsMultipleTimezone) {
            moment.tz.setDefault(abp.timing.timeZoneInfo.iana.timeZoneId)
          }
        }

        this.prepareSplashScreen()

        // Wait splash screen until delay time
        setTimeout(async () => {
          this.setState({ loading: false })
        }, AppConfiguration.appLayoutConfig?.loader?.delayTime || 0)
      } catch (error) {
        this.setState({ loading: false, error })
      }
    }

    prepareSplashScreen = () => {
      let loaderType = AppConfiguration.appLayoutConfig?.loader?.type
      let loaderMessage = AppConfiguration.appLayoutConfig?.loader?.message

      if (loaderType === 'random') {
        const arrayTypes = Object.keys(splashScreens)
        const randomNumber = Math.floor(Math.random() * arrayTypes.length)
        loaderType = splashScreens[arrayTypes[randomNumber]]
      }
      if (
        loaderType === splashScreens.xmasSanta ||
        loaderType === splashScreens.xmasNight ||
        loaderType === splashScreens.xmasHouse
      ) {
        loaderMessage = getCountDownXmasMessage(loaderMessage)
      }
      this.setState({ loaderType, loaderMessage })
      changeBackgroundByEvent(loaderType)
    }

    destroyDelayTime = () => {
      this.setState({ loading: false })
    }

    render() {
      // while checking user session, show "loading" message
      const { loaderType, loaderMessage } = this.state

      if (this.state.loading) {
        return (
          <LoadingSplashScreen
            goNext={this.destroyDelayTime}
            destroyTime={AppConfiguration.appLayoutConfig?.loader?.delayTime}
            loaderType={loaderType}
            loaderMessage={loaderMessage}
          />
        )
      }

      if (this.state.error) {
        return <Exception type="404" />
      }

      // otherwise, show the desired route
      return <WrappedComponent {...this.props} />
    }
  }
}

export default withSplashScreen
