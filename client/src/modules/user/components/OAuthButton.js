import React, { Fragment } from 'react';
import { withOAuth } from 'aws-amplify-react';
import { connect } from 'react-redux';
import {
  Card,
  CardBody,
  CardGroup,
  Col,
  Container,
  Row
} from 'reactstrap';

import Home from 'modules/dashboard/DashboardRouter';

import CustomerLoanDetailsImg from 'assets/loan/customer_bank_details.png';
import ShapeLoginImg from 'assets/shape_login.png';

class OAuthButton extends React.Component {
  render() {
    const { user } = this.props;

    return (
      <>
        {!user ? (
          <Fragment>
            <div style={{
              height: "100vh",
              backgroundSize: "cover",
              //backgroundColor: "purple",
              backgroundImage: `url(${ShapeLoginImg})`
            }}>

              <Container>
                <Row style={{ paddingTop: '50px' }}>
                  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANQAAAA6CAYAAADIkHfqAAAABHNCSVQICAgIfAhkiAAAHFpJREFUeJztXXtUG1d6/12BJEACJMA2tkkQOHYcJ47lxKmd2IlJ6zy6m90g9eHddhuTbdps92w2iG5OC+7Z4NPdeNuuA9lmN/twN7D1Jm7jIMh2U8eOa7AjI8xDAhwbsHmapzEPIYMlGXT7x8zgQcyMJCQMOP6dwwHu3Mc3M/e73+Pe7xsCFteuXVvh8XjyAfItLFFQSp0AKUxI0PwLIWR8oem5gy8eCAAMDzu+RunUrwkh0YQQUEpByEKTFhwo5f9N+2Uy8iWtVmvz185aXLMjLiXuF+5x1zLtas0yf/VHekYHb1yfHI9LjouiN7xN1x3jlddHJn6x/aXtnYHSajloSVVqop+XEZIcbFsxVB6q3a2Mlm1yX/fWP/qNh/9rrv1wtAHA5Li3btueLZ8F0q7mSN13ZYQkh3N89+j1MqlnU3modndUnGIXALhH3MWB0lp5qHa3Jjn2W5FREekjPQ6vZlXc6tHesZ4otSJSlRDjGhscL5+4MvYDqbFHRkY0ADIA2AHo2d86Mjo6usbrpZcAsIy0xDjJB5QChACU0guJiQkbpOpaDlpSiVxurzpUo3E53UGPFRWrxN0PpSB1y13umARV61j32Mv+XmpdScN+79SUqfnkJSUA3PvkPe4bbu+eUCahvazR1t3Qq3f0jSF+ZRzueWJN//qd96wMth9rcc0OpVZR0mbpWOZyurH28XTQKfrvW7+x5btibSwHLamxK+M/66rrSXH0jWHFumVISkv6RP/8A88GO37tB7ZsCvyos+ayEgDW7bzHc234+gtCz6bqUM1P3Nc9r1y29QAAVqxbhtgktSSttR/YslXLY/+h29ad3FLRCkffmGC9ux9KwdrH06GIUdhdo+5XxN7pyMhIhlarLR8aGimUyWD3eqEjQ0MjRwjBnwR780sD5O8SEjQ/F7v6yY/LTXVHbG+GY6SoWCUe+fpmV2xS3G83ffX+l8TqffzG8fH6j87F8Ms2Gx+8GpsQtWUukqrmA9t7p39Z+XX+ghAVq8T9z97306f//snvBNPXJz8+8X91Rxqe5Jfd/VAK1mxNe1xsUlX8zHL4zG/O7uaXrVi3DJu+cr/p4T/bXBjM+Ef/9cSgraQhiV92/zP3tX9137Pp/DLLQUtq8+mOxoHmK7Ezxr13ufObxX8ZJ9R3w8fnK7tqL29r/P35YEjCI1/bjGXpSUc3ffWBP/a9xjHUyMhIJgCN1wudjBD8UVAjLCFQSp+Wun6luT81XGO5nG6c/qU1qvaI7a+rDtX8RKjOsQMVX/JlJgCwlTQkXb924+1gx7QctKRerGj7iq90dTndaK/u2hJsf+3WzrW+ZV113bh6efgPxdrYPmpI8S0baBnE+WPNumDGrjxUu9uXmQCg9UxbmuWgZcZ7umS5vNGXmQBgoPlK7KmffTZrMWv8+HxlzeG6oJkJAKoP22B5t+rZs+/XVfnSodVqy9nfpVqttigxUZsvA6BZ4lqeKAiBJMN0N/aNhnvMgZZBfH6s6ZXaD2zZvtee/vudH4u166rrfq7yUO1usetCmPKS33bUdKmFrg23D1mD6QsARrods5gDALqqu2ctAhwUKuVGofJgn23526cGhMpdTjcuWS7PGEO9XP2cWD+W31Rf4v9f+4Etu/pw3baBlsFgyJkBR98YLL+2/kGUVn3UX10ZMNOgv71A5Qsx6kDLINqru/YIXaOgFWJthjqG/inQMWo/sGWf+98L20UrEFIaaF/+4BhwuESv9TgEVaxwovdC3zX+/y0VF/slqnfw/+k5N/DdUJiJg8vpRtWhmvWWX5+VfEeRIY90myLXahKV2/u3FegA6EBpNgh5XqjOZVuPvvJQ7W5fg5pOkWwSAUHv48WKSw9UHar5iZRhzaHn3MB3xYxqUFqWW5VT7q+P2w6UOnKrcqYZylpcs6Py0Nk00eqgnQSkiHphB4GOgOooQSYBEdRsHH1jaLO2ZwL4gVift4ShBluH0F7Zge763hnlSemJuO/pe7FsTeKtICNsyLWaOsCshOX7t75ZCEJe9a3jcrox0DywBcAMhtpbbbLv31awD8DrQm16P+//puWg5YCUg8Lya+t/nH2/TniiUOoAIbPUzS8IZiwirZXtT4t5bylocZ41J0vgUvYbWwuyCWg+CIn3vegcvPawFAHzwlDuax60V3bgcn0v2s60wzPuEazX09CL+tJGrH5wFbb+1cNY/eCq+SBnXuF2k3xlFGYxFACMdo0IrhRuFwoVUTRLaCVsOnlRFbti89sAviLU1nLQktpV1/Pn4hOF5OcxDH/bglKMCtn9FGQGQ3XZu71ifXhc4otOXpWp8IePFJTLZLTcl6kcvY4yKdpkUheDwWDrEOpLG/H+t4/gl3/yLo7/+CSajjfDM+6BPFqOhLUJiFijwMQK9/RP4qYExCTGoKehFyWv/Q4XjjeHi5xbhny7aRSU1gtdGx0YWyfWhoAIrY4ApB0UUo4IUFqfV2UKylW9FEEI7CLlM+zGpLTEx4TqUYrRfLtJ0mmyt9pk93pJBgWd1hQoaKfXS/Kl2oUkodorO3DJ0oGehl44B5wzrsWtjoMsXobeoQGcO9cAdM1uf+4cw0C7Ht+BsaYxfPrjcriveaA3CDqOFi0owaiQwTUxev2SQDEAINdqKt+/9c0yIRtsoGUQy9ct/yf4qIu1H9iyq96rk3JEfCFUPbcLdmWUTyFjN86QzFfbh84AeMq3fXScUmM5aEn1t++3t9pkB6Dbv60gAwDyrP7t0jlJqMHWIRS98B7+J/8TNB1vhnPACUWMYloKdUX241P7ZzhWcQrnGpuhjoyBKjIGMgjb+Z+e/gwRaxQAgNM/P4PB1qG5kLUgsBy0pGpWxu8UukZAJFUvt5tkgVKH0DXOQcEv8+OIeCvXavpCOCJYreCtGYWEBCyZXU43ZArF73z3lcSQazWVB/ps58RQnx44CeeAE/JoOTQbNJi6i+CzzhocPVOOSmsNBvquIDZShZSYZGxMWIcN2ntwv/YebFm2EQ9q78WqmBUgPsxVaa1BwlotAIaplgrkquj/Fp3kQJFU23y7aZRCWIXgOShSAcYR0XqmTdQR4XZLqyK3G3KrcrIBvAhgn3cKm4UmvHcKolsH1v+s3hizPLZaaL8wFASt8g22DuEqK0H6FENoq6gFKBAtj0a8XIU4uRqxCjUiiDCvRkUqkRK5AnFyNZodbaC4uQlmb7+Au5GMnoZeDLYOLVrvX+Wh2t3qxOjdsgjyVMU7ZwTtGQpakWfN8escyKsyFb6x7c1MAjJLynEOCstBy3ckHRGUZPmzCW5H5FpNkgvW3mqT/Y1tb1YIPVuX042jb5xYtvHLGwqaKi79g9c1+faGZ9b/MFSagmYoz/jNl+rsHsOa2LsQp4iFXBZcV3EKFe5SrUTX+E1Xen/fFegfvw/DTSNos7QvOoaqK2nYr1TLv9N3fkBt+9AuergSlDo8bpIZaL9Se1Nddd3PPfDlDQ+IOSIoaEXe2ZywbeLebiCMBnBS7Hrj78+j8ffnk9ftXPODz49d+EePa/Kwv5PmUgha5UtKv3ncanVsMhKjtEEzE4fkmCTERs481XLdy7jYexp6hZosGKzFNTs6q7te+ej7R9XVh22SzOT1koxgJAZr/O4TujbQMogTBRXC5+IodUh5C++AsX/AqIaSaKloxUffP6q2Hal/SRkf03zh05aTgdpYfATNUEq1AmnbmPcbkxAdbPNZuFs9c+/p6uhwyH3OB1or259uOnlRJVVHkxLf43YTHcsgQcHtQiHfRRsQCCnMvc33nMKBXKupiHphEHMA8THQMojjB8qVJ396OkMZH9Ns+6jxV8GMNSenRIqeYYLoaOVcms+ASh4DZYQi5H7mG522br+cvnxN0mrjD59qtBbX7Ai2f397U7NAaX2u1fSFckSEgryzplK3m+goaHEg9R19Yzh+oFx5/mjTS+eOnr8UqLSaE0OlP8pIKGf3NUx5RTejA4Yq4qakS9YyKqVCFTqzhhO+m4ZCaKloxYnCUykTjoljYiEcUsi1mspBqeROPI+gL8SeUziRbzeN5llzsrxT2BwoY3XVdeP4gfI12rSkukCYak4MFZcci9jlaoAARBX6YQt+lDC5xvzNScHFglyrqYNSmPzVczndqHqvNnqwfeiVuTCV1N7UNL5Ae07zgb3VJjt7ji8NlL7l73m7nG6U7f04QR4bPT8buwCQ/hizJRIbL2lWBIRJ7xQA4P7778VYD2Psc1JwMYE91pMG4EVQ+pZYKAbAeI96P+//ZrDqn9TeFIAls+e0fG3SAwtNgz/kWk0duVU52blVORoAL/qzYS0HrbqTP7P8SKrOnBkqZRMjQbye0FQ+SinGJyegVquwUs7kSIldEQvnFaeflguDXKupI9dqKsqtysnOs+ZkAEgTUx+aTl5UedweyRcgBMnzeIQULqY9J9H4rouDs6JvFzNyraaiPGuOjlKYxCSWy+nGleYBwTg3DiFIKEaCXB++jhuyqbl2g2G3A5N0Co89/DAmXZMAAOeAEyWv/Q4lr/0OY/2Lk7E45FpNHXnWnCyxiXXZ3rN9Lu7XUGA5aEmt+9D2hu2jxl/NxUGyELhbnyIaZn8r1du8KlOh10syxJiqraozWSjMnkNIBhDnPo/W+J5UDAxe6kX3OBN8eaziFMqbrOiK7Efc+jjIo+XoaejF+98+sjTO9nmFz5J11XWjv3nomVtFRu0HtmxlfEzzhROXcs8fbXppcurG8WBD68MBzWrN5mDqD3eP+E3hdquwt9pkBxHfmO+0dYuqsyExFOc4iFIE7/amlOLSWBfc3pmxUv19V/Dp6c/QeuMy1MlqeMY9KHnto0XPVEQGUTUsJiFGMIxgPjDYPrz3+IFyZVddN7rqunH6l9aonobuf/TX7tiBii+JXaNe4XAJACBU+JqjxxEXjHSURyueEBw72L05HqzFNTuaKy7W9ZzvHwl2PynXaioXGzsiMmKTWLuQGIpzHFzrG592LAQKQgh06hSsj0/HyujlUMhmMmV/3xX8X+MZJKzXTjOV+5pwoOJih72s8ZZsvloOWlIvHG+eZbtw4fhSbUc6h0RzGEotFpQSUXWs53z/N6TG5FB5qHb39dEJsfHnpO5Zi2t2TDgmjn38g+Obf/PN9zW2I/UvNfz+3OUg1W/B99ZhuyyaHiEkhuK7z2WqiKDbKyIiEadQ4y51MjYl3ItU9apZIR4Wey3iVsfBM+7BqXcsoZA7r1jzqO5vxK5RKj4hww2hA7RsOL7k8RsSKXtZ7JqUDUNk4tLL0e/4i0DUzYmha/miiUYpCfrUCcAwc9V7tdFcvwMtgzhReColdmX8Z4EylVhYjhRC3kSadp9rRDNNBQRCCFZEJ2GDdi0icZM5nc5r6J9kstY0fdqyKJ0UVYdqfnJtaPwvxK6LRZiGG9tf2t4pZkz3nut7Rmxf7PyJls97GnvvEexUJBqZQ67V1CHq6Wu+EitXyorFQiSsxTU7aj+sv9DwP5+vF+vf45YOgRHDcNdwum+Zy+nGicJTKRFRSqs/Rm/8+Hyl2HlNAnGpHHJOiTXbdagvbYTXHZ5cZDGRUUiLuwsXx25K23PnmvHsYzsxfHEEbZUdCx7RW3modrc8iqyIUMg3KlUK44VjzQmiqaqYTDy3zEtFCUoJMMu16+gbw6Uz7a+0VXW84HZ6bAAgk5P4SffkWmvxWbVEjgr/E9pLCiGD4Gp+/EC5ct3ONQWfH7vwz5oU7eRY75hdoYpMcU/cSLjaNpRQ+fOzglKVGZsW59tz5iTdxaJ1XU43Tr59OvmRr20+fP5Ey/ddo+NlXH55y0FLarQ25mWFSvnnZ9+rWyPWt5RNGTJDrX5wFRQximn3udwbvOrnC60yDvFyNRw3bqZjc3iZj2lcON58Sxjq1K/OiK4QN6670dt4FY6+MfjL+UYDOLIUTrDhCoJ7JayjIh5Axop1y/zSzoah+GWovLOm0v1b36wHIYLGektFK1oqWrnwkwx//XFjUxHPaSBwu1CoVNJsocxFAJMRFodtGzZ+ecOGuOTY3FO/OoMpCvSevwLJDLOUOqTCZcKS9Wj1g6vQbu2AShMNz3B4HAcpqmQ4Rm+mZBi4ehVJiJsObpxvWP6jKvROmAl5S8/c5VpNHfu3vvmWUGozPgJJ/khB8gPeRCYkE5TaxSZwsKAg+XM5tc8h324a3b+tIBvAu1L1gk3PLHmKBWHKerRmB+Pti5SFL1GrSh6DKJ7nr+3SEotSmENcVLiQW5WT7c/28QtKy4LJoJRrNXWAkOxAQiT8Dg1aHI7sTWxEr99YqEBBQSv80RUWhlq9kdmPmhgcD8vpcw5qeejnBKUgpQuH1C9oJwjJDGWFFTP0A6XZ7SYZUmcN/YxdnFuVE3DEMYdcq6lI6pRBQGNTmEQSUM4JXCxUKPtZAPM+PC7/UdhhYai45FgkpScCBIiMC1/uTEXETYmnVoefuTweiG7ezQVsX/s8LqIP+biMgP1AQTvzzpoCssnYUIUMMAd5A5rgLP1PhjKh91ab7G430QHYFwxjsech0+Yjr2DeWVOpx0X0szIlBUQYdbBMHpC2QYaHR8Linjv1zhnUlzZCtTIG430T4egSXeN96J9gdP2HNm9CZDeFIkaBl82BSnHamJCQ8KBUjf3bCnSgtBBARrD6PwXtJBR2EGIHEHCqqUCxf1tBFijNBqADUA5CsucaofvDRwr0sghkUtAZTgFCMUpByqkX5aFI1ADGZfLB88YFIXbqhd3jQfmtUo3z9QUaZRQyQWmmWF56gJFIBKTI7UJpMLSFjaG47K+RUXJMum6Eo0tcdHRgxMPsBTz7+E4MN40gbZsOz+0L9Gicf4a6gzvgElkCgHcKo6EsLGHTzzj3uWfCgxuySci9oXXtpV6MsW5ztVqF4aYRAMCGZ+4NmdY7uAM+wqlZhC23OYDpZP8qbWinJgBg1D2GKco4OLY/yHyMLyk9cTps5A7uYDEirAzFuc/nmlaMw6R3CpfZsI5Ht23ByEVGOu363pNSze7gDhYc4ZVQrPt8/MoEJr2Tc+6nzcmEdfzRE49jqpXZKN71vYxFl/jyDu7AF2FlKL77XB4ffIzUFPWibewyVq9dhV36HXBeYLyumzI34r6nFt52MpvN865vms1mzXyPEW4sFppvxfvxh7B5+ThU/aYGZ39bC1WyCuP94wG1oZRiKsqLhBQtJh1TmLjKtFPEKPDEtx8LgZmkvXxms7kQEP5YGg92g8Gw2Ww2Z4E5xmIyGAzz8g0ms9mcASZt8FsGg2FJpAkzm816ADawz2mBaNCwNOgWkg4gzBIKANK3M+Ecbof0mT4v9YLEyBCzLAbyaDki3REYax2bZqb1u9bh6+/86XxLJjultIL74QoppfW8Mq6cW/3mczXOYMfXz+MY8wJKqXYBh+f26gBAzy5+C4KwfxJ02ZrEafc5jQII7/vhU8SLaE0UImQRmLg6ATrhxcQEswmsiFEg/TEdUvSrkP5oGpTq+c8mazAYisD75IzZbKYAQAjJNhgMd/LeBQCDwWA3m81phJCFzMS0BwAopWWE2ax9FX4+JTRfmJdv7KY/pkPTpy2QIxIRSZGQyWS44fAA7kl4RhjJRQhh3OCP6pC+PW1JORzMZnMmmJeWASZE+y2DwVAqUccOoJStF5aJZzabXweQCUAPoJxSWmQ0Got96mTwaNCAkciF/Ho8Og28uga2/rsAuOM6UvdbAKAeQD7bZz6ATWAOpr4KIIvtrxyMyjx92oNVGV9n7wNgGKGM7dNkMBgkN1lZ+nWUUgchJAvACBgppee3ZdXCd9m+R9kxdWDezYz78aG/gH3OHSz9+6TeYdhVPgB44u+2Iyk9EZOuSbivunD9ygQm3ZNQxDAfGtj1vQz87Ycv4uvv/Cm2vrBlSTETmAlippQSSmknmElm5hvErG1mBpDBqo5aMJPtZDgMeLPZbAOQTylNY/vfTAgpMpvN7/Lq6MHYY5msClsPQM/Wm7bPKHO0ibPd8imlm8FM/iy2/HWp+2WZNpPSm0ea2L8zAbRTSk1sOw1bxqdRx6NRy9bjPj/D9SEJSmkWABBCitiJzi0Wvjaonu2vgHc/Dt79ZPL65NNv4J4d26fop3GAeWIopVoB4799FY9/6zGs37UOf/CXD8P4b1/By+YX8dy+Z3DfU/feEpVuPsC+9DSj0ZhhNBp1PNsrA5ieyK/61gPzuRrupcwZLDPoKaUVhBCd0WjMIIToKJMTPYud4ACzor4IQMvSoAeYVNKU0lkTlVJKADxpNBo1fAnCloverx+UGY1GjdFozADAOQr4jFcIQMOqajq2HsdYgTwLDbl5Ho9zFHGSRvCcHns/m41Go573XgCG0STpZ+mStNHmhaEAhqn0ho146rUnsfWFLdOnKJY6CCGl/AlHyHR+AU5CZbLlhfx6BoMhn10RJTOP+gPHDKydN8r2PUrIdOBbFlcGRkXZYzabXy8pKXme804SMvuLfmJ2YwD3K4VpO0ZIdePoIIRk+dxLoFHOWQDjROJoNBgMpZxEFJn4dj4t7HvpBKBjF0NR+nnPWNRpNC821BcZlNIM9uMHBWazedaqR2louxQ8ZrCZzWah8TXAtCpmBiMBOtmyxZYTXQNMM/9c8CoAEEJOlpSUTC8ShBAbgFQwi1cgzokOtr4/dbwDkPbC3uYMReZ+XGOuIxLSAWAnGGN+1krLXp8zKKWdhJBUMOrcrL4IE0oCSmk+IUQDwGQ0GguBGftciwKsIyHebDZrgmUq9l44KZlNhD/vk2E2m3V8CSsEEnjYjoatL9pfJIA2AOmU0hmflVnKoBQgBKAUrQswfDmYlXEngPxwefU4sCrXHgA7Wbe/GLjJNq3GGQyGciGptoAoB2PrFIANVWedNqJxSjxw6p4DEIxi1rOMkg2e3UoISeUzMMuYekqpw2g0+qq8epZGji7uEIB41iNKUUYITLcLMwEMMzG/ZR/e6rENBkNRSUlJFquatZvN5iIwbtpMMJN8cwAr5k5uT4wH7gRANqU0kxDCOSCKcNODBoPBkMb2wTHe6yUlJZzttKhOX7A2yfNgnCmZYCaqnlJKpOYjO7n3sH1kCy0srHr7OluPf986MOpyKW56M0GIYIalArPZvBOMJsB3z4suZDJA+SZw6zKbzic4ycTClpAQfzi49rSCXfGEJrzd5zcHru706sZ6hfaBeWHZYFzBegBlfpipiIqEjXMnEVijnfPq6di+s9nr/BDvbNYjl8kyVxmACkqpg38qhOdk8KWLK/edG1y96efB0jxdjxDSISQ5eM8X7L3YwXjPylg3dhqAt0QmN3jtRtn7cEBArWZRxNaZ4TFk770MzHvhnBb7DAaDkH1pYrcRssEwUz0hJENK6yAAMDTk2AZMHSOExErdyNIBPadQKHap1eqBhaaE3WvR+NugDKF/PYBRMUZlV3P9Ujr5wUr1PQBe9KPWBtNnBoCTlNIKo9GYwT4XndB7KSkpKWc1jCdZNVkPoCMQ9T0SABIT463j4+PrPR5PDqV4CPPoTp9PUErdAPkkIUH7DiHk+kLTAwD+1Lsw9C/JqDz3+aID75RGKaXUDgCE+YzMHla1mje62ecS0CIXzGI47eVTqVS9AL4XPGl3cAdzRgd7yiODbzOxzJQ9T4tRMOZN0OPfPp6IO1iSYFWvDNzcLO0AUBpu7yg7VhaAcn+Myqrpurmoyf8Pevuojudmg9EAAAAASUVORK5CYII=" alt="auth button" />
                </Row>
                <Row>
                  <Col md="6">
                    <img src={CustomerLoanDetailsImg} alt="TeamWorkImg" width="100%" />
                  </Col>
                  <Col md="6">
                    <CardGroup>
                      <Card className="p-4" style={{ height: '570px' }}>
                        <CardBody>
                          <h1>Welcome Back :)</h1>
                          <p className="text-muted">
                            To keep connected with us please login with your work email address and password
                            <i className="fa fa-bell" style={{ color: 'orange' }}></i>
                          </p>
                          <h2>Features</h2>
                          <ul>
                            <li>Manage Users</li>
                            <li>Manage Department Hierarchy and Roles</li>
                            <li>Manage Permissions</li>
                            <li>Scheduling Jobs, Reports for the applications</li>
                          </ul>
                          <button
                            className="btn btn-danger btn-block"
                            style={{
                              marginTop: '20px',
                              padding: '20px'
                            }}
                            onClick={this.props.OAuthSignIn}
                          >
                            <i className="fa fa-google" /> Sign In With Google
                          </button>
                          <button
                            className="btn btn-info btn-block"
                            style={{
                              marginTop: '20px',
                              padding: '20px'
                            }}
                            onClick={this.props.OAuthSignIn}
                          >
                            <i className="fa fa-windows" /> Sign In With Mircosoft 365
                          </button>

                        </CardBody>
                      </Card>
                    </CardGroup>
                  </Col>
                </Row>
              </Container>
            </div>
          </Fragment>
        ) : (
          <Home />
        )}
      </>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user
});

export default connect(mapStateToProps)(withOAuth(OAuthButton));
