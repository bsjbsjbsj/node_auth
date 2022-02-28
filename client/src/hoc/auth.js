import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { auth } from '../_actions/user_action'
import { useNavigate } from 'react-router-dom';

export default function (SpecificComponent, option, adminRoute = null) {
    //null    =>  아무나 출입이 가능한 페이지
    //true    =>  로그인한 유저만 출입이 가능한 페이지
    //false   =>  로그인한 유저는 출입 불가능한 페이지
    function AuthenticationCheck() {
        const dispatch = useDispatch();
        const navigate = useNavigate();
        useEffect(() => {

            dispatch(auth()).then(res => {
                console.log(res)
                //로그인 하지 않은 상태 
                if (!res.payload.isAuth) {
                    if (option) {
                        navigate('/login');
                    }
                } else {
                    //로그인 한 상태 
                    if (adminRoute && !res.payload.isAdmin) {
                        navigate('/');
                    } else {
                        if (option === false)
                            navigate('/');
                    }
                }
            })
        }, [])
        return (

            <SpecificComponent />
        )
    }


    return AuthenticationCheck
}

