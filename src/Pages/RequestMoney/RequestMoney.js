import React, { useEffect, useState } from 'react'
import Container from '../../component/container'
import { RequestMoneyData } from '../../API/RequestMoneypi/ReqMoneyApi'
import ReactPaginate from 'react-paginate'
import Loader from '../Loader/Loader'
import { ManualBankStatus } from '../../API/RequestMoneypi/ReqMoneyApi'
import { useRef } from 'react';
import { useFormik } from 'formik';
import * as yup from "yup"
import { useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import moment from 'moment';
import { toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
// import CopyToClipboard from 'react-copy-to-clipboard'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import BaseUrl from '../../API/config'

const AddSuccessToast = () => {
    toast.success('Status Change successfully.', { autoClose: 2000 });
}
const addErrorToast = (massage) => {
    toast.error(massage, {
        autoClose: 2000
    });
}
function RequestMoney() {
    const [data, setdata] = useState([])
    const [count, setcount] = useState(0)
    const [id, setid] = useState()
    const [search, setsearch] = useState("")
    const [loader, setloader] = useState(true)
    const [pageNumber, setPagenumber] = useState(1)
    const [totalSize, setTotalSize] = useState(10)
    const [entries, SetEntries] = useState('10')
    const [example, setExample] = useState(false)
    const [scroll, setscroll] = useState(false)
    const [Toggle, setToggle] = useState()
    const [loading, setloading] = useState(false)
    const [country_flag, setcountry_flag] = useState()
    const [sortedBy, setSortedBy] = useState("id")
    const [orderBy, setOrderBy] = useState('desc')
    const token = localStorage.getItem("logintoken")
    const [selectedValue, setSelectedValue] = useState(true)
    const [recentTab, setrecentTab] = useState('All deposits')
    const [reqmoneymsg, setreqmoneymsg] = useState("")
    const navigate = useNavigate()
    const ref2 = useRef()


    const reqmoneystatus = (data) => {
        // console.log(data, "datatatatatatatatatatatatatatatatat")
        if (data.req_unique_id != null) {
            setreqmoneymsg("Reqmoney")
        }
        else if ((data.request_identity == "Local Send" || data.request_identity == "International Send") && data.request_type == "wallet") {
            setreqmoneymsg("Wallet")
        }
        else if
            ((data.request_identity == "Local Send" || data.request_identity == "International Send") && data.request_type == "Manual Bank") {
            setreqmoneymsg("ManualBank")
            // console.log(reqmoneymsg)
            // alert("aadil")
        }
        else {
            setreqmoneymsg("")
            console.log(reqmoneymsg, "kuch bhi nhiiii")
        }
        setid(data.id)
    }

    console.log("PPPPPPPPP", reqmoneymsg)

    const signUpSchemas = yup.object({
        ShortName: yup.string().required("Please Enter Massage"),
        role: yup.string().required('Please select Role'),
    });
    const initialValues = {
        ShortName: "",
    }

    const form = useFormik({
        initialValues: {
            ShortName: "",
            role: "",

        },
        validationSchema: signUpSchemas,
        onSubmit: async (values, { resetForm }) => {
            // console.log(values.role, "is_request_money")
            const datas = JSON.stringify({
                "is_request_money": JSON.parse(values.role),
                "comment": values.ShortName
            })
            console.log(reqmoneymsg, "reqmoneymsg")
            // console.log(datas, "datatatat??????????")
            const ManualBank = await ManualBankStatus(reqmoneymsg, id, datas, token)
            console.log(ManualBank, "ManualBank")
            if (ManualBank.status == true) {
                ref2.current.click()
                form.resetForm()
                AddSuccessToast()
                GetRequestMoneyData()
                // setSelectedValue(true)
            }
            else {
                addErrorToast(ManualBank.message)
                form.resetForm()
                ref2.current.click()
                // setSelectedValue(true)
            }
        }
    })
    setTimeout(() => {
        setscroll(true)
    }, 3000);


    const GetRequestMoneyData = async () => {
        try {
            const totaldata = await RequestMoneyData(token, sortedBy, orderBy, search, pageNumber)
            console.log(totaldata.data.rows, "daatattadsddddddd")
            if (totaldata.status == true) {
                setTimeout(() => {
                    setExample(true)
                    setdata(totaldata?.data.rows)
                    setcount(totaldata?.data.count)
                    // console.log(totaldata?.data.count, 'totaldata')
                    const Count = totaldata?.data.count
                    setTotalSize(Count / entries)
                    setloader(false)
                }, 2000);
                setloader(true)
            }

            else if (totaldata?.response?.data?.message == "jwt expired") {
                localStorage.removeItem('logintoken')
                navigate("/")
            }
            else {
                setTimeout(() => {
                    setloader(false)
                }, 2000);
                setloader(true)
            }


        }
        catch (err) {
            console.log(err)
            setTimeout(() => {
                setloader(false)
            }, 2000);
            setloader(true)
        }
    }
    useEffect(() => {
        GetRequestMoneyData()
    }, [sortedBy, orderBy, search, pageNumber])


    const sortChange = (col) => {
        if (col === sortedBy) {
            setSortedBy(col);
            orderBy === "asc" ? setOrderBy("desc") : setOrderBy("asc")
        } else {
            setSortedBy(col)
            setOrderBy("desc")
        }
    }

    const Click = async (d) => {
        window.scrollTo(0, 0);
        var CurrentPage = d.selected + 1;
        setPagenumber(CurrentPage)
    };



    const handleSelect = (e) => {
        const selectedOption = e.target.value;
        setSelectedValue(selectedOption);
    };


    const GoToUserDetail = (id) => {
        console.log(id, "iddddddddddddddddd")
        navigate("/user-details", { state: id })
    }
    const copiedInfo = () => {
        toast.success(" Successful copy ", { autoClose: 1000 })
    }




    const GoAllreqTxn = (id) => {
        const statadata = {
            id: id,
            token: token
        }
        // navigate(`/transaction`, { state: statadata })
        navigate("/admin/deposits/transactions", { state: statadata })
    }


    var stillUtcs = moment.utc(data.created_at).toDate();
    var timeZones = moment(stillUtcs).local().format('YYYY-MM-DD HH:mm:ss A');
    return (
        <Container>
            <div className="nk-content ">
                <div className="container-fluid">
                    <div className="nk-content-inner">
                        <div className="nk-content-body">
                            <div className="nk-block-head nk-block-head-sm">
                                <div className="nk-block-between">
                                    <div className="nk-block-head-content">
                                        <h5>Deposit Request</h5>
                                        <div className="nk-block-des text-soft">
                                            <p>You have total <span className='fw-bold'>({count})</span> Deposit Request.</p>
                                        </div>
                                    </div>
                                    <div className="nk-block-head-content">
                                        <div className="toggle-wrap nk-block-tools-toggle">
                                            <a className="btn btn-icon btn-trigger toggle-expand me-n1" data-target="pageMenu"><em className="icon ni ni-menu-alt-r" /></a>
                                            <div className="toggle-expand-content" data-content="pageMenu">
                                                <ul className="nk-block-tools g-3">
                                                    <li>
                                                        <div className="form-control-wrap">
                                                            <div className="form-icon form-icon-right">
                                                                <em className="icon ni ni-search" />
                                                            </div>
                                                            <input type="text" className="form-control" id="default-04" placeholder="Search by name" onChange={(e) => { setsearch(e.target.value); setPagenumber(1) }} />
                                                        </div>
                                                    </li>
                                                    <li><a className="btn btn-white btn-outline-primary" href={BaseUrl + `clients/all/admin/deposits/export`}><em className="icon ni ni-download-cloud" /><span>Export</span></a></li>
                                                    <li className="nk-block-tools-opt">
                                                        <div className="drodown">
                                                            {/* <a className="dropdown-toggle btn btn-icon btn-primary"
                                                            // data-bs-toggle="dropdown" 
                                                            ><em className="icon ni ni-plus" /></a> */}
                                                            {/* <div className="dropdown-menu dropdown-menu-end">
                                                                <ul className="link-list-opt no-bdr">
                                                                    <li style={{ cursor: "pointer" }} data-bs-toggle="modal" data-bs-target="#modal-report" ><a ><span>Add Currency</span></a></li>
                                                                    <li><a ><span>Add Team</span></a></li>
                                                                    <li><a ><span>Import customer</span></a></li>
                                                                </ul>
                                                            </div> */}
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card card-full">
                               <div className="card-inner">
                                    <div className="card-title-group">
                                    {/* <div className="card-title">
                                        <h6 className="title"><span className="me-2"> Recent Transactions </span> <a href="#" className="link d-none d-sm-inline">See
                                            History</a></h6>
                                    </div> */}
                                    <div className="card-tools">
                                        <ul className="card-tools-nav">
                                            <li className={recentTab == "All deposits" ? "active" : ""} style={{ cursor: "pointer" }}><a onClick={() => setrecentTab("All deposits")}><span>All deposits </span></a></li>
                                            <li className={recentTab == "In progress" ? "active" : ""} style={{ cursor: "pointer" }}><a onClick={() => setrecentTab("In progress")}><span>In progress</span></a></li>
                                            <li className={recentTab == "Oh - hold" ? "active" : ""} style={{ cursor: "pointer" }}><a onClick={() => setrecentTab("Oh - hold")}><span>Oh - hold</span></a></li>
                                            <li className={recentTab == "Processed" ? "active" : ""} style={{ cursor: "pointer" }}><a onClick={() => setrecentTab("Processed")}><span>Processed </span></a></li>
                                            {/* <li className={recentTab == "" ? "active" : ""} style={{ cursor: "pointer" }}><a onClick={() => setrecentTab("")}><span>All</span></a></li> */}
                                        </ul>
                                    </div>
                                    </div>
                                </div>
                            </div>
                            

                            <div className="nk-block">
                                <div className="nk-tb-list is-separate mb-3">

                                    <div className="nk-tb-item nk-tb-head">
                                        <div className="nk-tb-col "><span className="sub-text fw-bold">Name{sortedBy == "first_name" && orderBy === "desc" ? <em className="icon ni ni-arrow-down" style={{ cursor: 'pointer' }} onClick={() => { sortChange("first_name") }} /> : <em className="icon ni ni-arrow-up" style={{ cursor: 'pointer' }} onClick={() => { sortChange("first_name") }} />} </span></div>
                                        <div className="nk-tb-col tb-col-lg"><span className="sub-text fw-bold">TXN ID{sortedBy == "txn_id" && orderBy === "desc" ? <em className="icon ni ni-arrow-down" style={{ cursor: 'pointer' }} onClick={() => { sortChange("txn_id") }} /> : <em className="icon ni ni-arrow-up" style={{ cursor: 'pointer' }} onClick={() => { sortChange("txn_id") }} />} </span></div>
                                        <div className="nk-tb-col tb-col-lg"><span className="sub-text fw-bold">Amount{sortedBy == "amount" && orderBy === "desc" ? <em className="icon ni ni-arrow-down" style={{ cursor: 'pointer' }} onClick={() => { sortChange("amount") }} /> : <em className="icon ni ni-arrow-up" style={{ cursor: 'pointer' }} onClick={() => { sortChange("amount") }} />}</span></div>
                                        <div className="nk-tb-col tb-col-md"><span className="sub-text fw-bold">Created At{sortedBy == 'created_at' && orderBy === "desc" ? <em className="icon ni ni-arrow-down" style={{ cursor: 'pointer' }} onClick={() => { sortChange('created_at') }} /> : <em className="icon ni ni-arrow-up" style={{ cursor: 'pointer' }} onClick={() => { sortChange('created_at') }} />}</span></div>
                                        <div className="nk-tb-col tb-col-lg text-center"><span className="sub-text  fw-bold">Status{sortedBy == "status" && orderBy === "desc" ? <em className="icon ni ni-arrow-down" style={{ cursor: 'pointer' }} onClick={() => { sortChange("status") }} /> : <em className="icon ni ni-arrow-up" style={{ cursor: 'pointer' }} onClick={() => { sortChange("status") }} />}</span></div>
                                        <div className="nk-tb-col  text-center"><span className="sub-text fw-bold">Action</span></div>
                                    </div>

                                    {
                                        loader == true ?
                                            <div className="nk-tb-item">
                                                <div className="nk-tb-col"></div>
                                                <div className="nk-tb-col tb-col-md"></div>
                                                <div className="nk-tb-col">
                                                    <Loader />
                                                </div>
                                                <div className="nk-tb-col tb-col-md">
                                                </div>
                                                <div className="nk-tb-col nk-tb-col-tools tb-col-lg"></div>
                                                <div className="nk-tb-col nk-tb-col-tools tb-col-lg"></div>
                                                {/* <div className="nk-tb-col nk-tb-col-tools tb-col-lg"></div> */}

                                            </div>
                                            :
                                            <>
                                                {
                                                    data.length == 0 &&
                                                    <div className="nk-tb-item">
                                                        <div className="nk-tb-col"></div>
                                                        <div className="nk-tb-col tb-col-md"></div>
                                                        <div className="nk-tb-col">
                                                            {scroll == true ? <h6>No Request Money Data Available</h6> : <Loader />}</div>
                                                        <div className="nk-tb-col tb-col-md">
                                                        </div>
                                                        <div className="nk-tb-col nk-tb-col-tools tb-col-lg"></div>
                                                        <div className="nk-tb-col nk-tb-col-tools tb-col-lg"></div>
                                                        {/* <div className="nk-tb-col nk-tb-col-tools tb-col-lg"></div> */}
                                                    </div>
                                                }


                                                {
                                                    data.length > 0 && data.map((data) => {
                                                        // console.log(data, "setreqmoneymsgsetreqmoneymsgsetreqmoneymsg")
                                                        return (
                                                            <div className="nk-tb-item" key={data.id}>
                                                                <div className="nk-tb-col">
                                                                    <a >
                                                                        <div className="user-card" >
                                                                            {
                                                                                <div className="user-info " style={{ cursor: "pointer", }} onClick={() => GoToUserDetail(data.client_id)}>
                                                                                    <span className="tb-lead " ><span style={{ textTransform: "capitalize" }}>{data?.client.first_name} {data?.client.last_name}</span>
                                                                                        <br></br> {data?.client.email}<br></br>
                                                                                        {data?.client.phone}
                                                                                        <span className="dot dot-success d-md-none ms-1" /></span>
                                                                                </div>
                                                                            }
                                                                        </div>
                                                                    </a>
                                                                </div>

                                                                {/* <div className="nk-tb-col tb-col-lg">
                                                                    <a > */}
                                                                {/* <div className="user-card" > */}
                                                                {/* key-request_identity, value-International Send,
                                                                         key-request_type, value-Easy Bank Manual, wallet, Google-pay, card, Manual Bank */}

                                                                {
                                                                    // (data.request_identity === "International Send" && (data.request_type === "wallet" || data.request_type === "Google-pay" || data.request_type === "Manual Bank" || data.request_type === "card" || data.request_type === "Easy Bank Manual"))
                                                                    // && <div className="user-info">
                                                                    //     <span className="tb-lead">
                                                                    //         {data.request_type}<span className="dot dot-success d-md-none ms-1" /></span>
                                                                    // </div>
                                                                    // <div className="user-info">
                                                                    //     <span className="tb-lead">{data.ref_id}<span className="dot dot-success d-md-none ms-1" /></span>
                                                                    // </div>
                                                                }
                                                                {/* </div> */}
                                                                {/* </a>
                                                                </div> */}


                                                                <div className="nk-tb-col tb-col-lg">
                                                                    <a >
                                                                        <div className="user-card" >
                                                                            {
                                                                                data.txn_id == null ? <div className="user-info">
                                                                                    <span className="tb-lead">N/A<span className="dot dot-success d-md-none ms-1" /></span>
                                                                                </div> : <div className="user-info" style={{ cursor: "pointer", }}>
                                                                                    <span className="tb-lead text-primary" ><span onClick={() => { GoAllreqTxn(data.id) }}>{data.txn_id}</span><span><CopyToClipboard text={data.txn_id} style={{ height: '25px', width: '25px', padding: 2 }} >
                                                                                        <span className='btn btn-primary btn-sm ms-1' onClick={() => copiedInfo()}><e className="fa fa-copy fa fa-solid text-white" style={{ fontSize: '17px' }}></e></span>
                                                                                    </CopyToClipboard> </span>
                                                                                    </span>
                                                                                </div>
                                                                            }
                                                                        </div>
                                                                    </a>
                                                                </div>


                                                                <div className="nk-tb-col tb-col-lg">
                                                                    <ul className="list-status">
                                                                        {
                                                                            data.amount == null ? <li> <span>N/A</span></li> : <li> <span >{data?.currencyWalletDetail?.currencyDetail?.symbol} {data.amount}</span></li>
                                                                        }
                                                                        {/* <li><em className="icon ni ni-alert-circle" /> <span>KYC</span></li> */}
                                                                    </ul>
                                                                </div>

                                                                <div className="nk-tb-col tb-col-lg">
                                                                    <ul className="list-status">
                                                                        {
                                                                            timeZones == null ? <li> <span>N/A</span></li> : <li> <span >{timeZones}</span></li>

                                                                        }
                                                                        {/* <li><em className="icon ni ni-alert-circle" /> <span>KYC</span></li> */}
                                                                    </ul>
                                                                </div>


                                                                <div className="nk-tb-col tb-col-lg">
                                                                    <ul className="list-status">
                                                                        {
                                                                            data?.status == "pending" && <span className="badge badge-sm badge-dot has-bg bg-warning d-none d-sm-inline-flex">Pending</span>
                                                                        }
                                                                        {
                                                                            data?.status == "completed" && <span className="badge badge-sm badge-dot has-bg bg-success d-none d-sm-inline-flex">Completed</span>
                                                                        }
                                                                        {
                                                                            data?.status == "rejected" && <span className="badge badge-sm badge-dot has-bg bg-danger d-none d-sm-inline-flex">Rejected</span>
                                                                        }
                                                                    </ul>
                                                                </div>


                                                                <div className="nk-tb-col">
                                                                    <ul onClick={() => reqmoneystatus(data)}>
                                                                        {
                                                                            data?.status == "pending" && <button className="btn btn-primary" style={{ padding: "4px 15px", fontSize: "12px" }} data-bs-toggle="modal" data-bs-target="#modal-report"  ><span>Process</span></button>
                                                                        }
                                                                        {
                                                                            data?.status == "completed" && <button className="btn btn-primary" style={{ padding: "4px 15px", fontSize: "12px" }} data-bs-toggle="modal" data-bs-target="#modal-report" disabled><span>Process</span></button>
                                                                        }
                                                                        {
                                                                            data?.status == "rejected" && <button className="btn btn-primary" style={{ padding: "4px 15px", fontSize: "12px" }} data-bs-toggle="modal" data-bs-target="#modal-report" disabled><span>Process</span></button>
                                                                        }
                                                                    </ul>
                                                                </div>




                                                                {/* <div className="nk-tb-col ">
                                                                    <ul onClick={() => { setid(data.id) }}>
                                                                        {
                                                                            data?.status == "pending" && <button className="btn btn-primary" style={{ padding: "4px 15px", fontSize: "12px" }} data-bs-toggle="modal" data-bs-target="#modal-report"  ><span>Pdfgdg</span></button>
                                                                        }

                                                                        {
                                                                            data?.status == "completed" && <button className="btn btn-primary" style={{ padding: "4px 15px", fontSize: "12px" }} data-bs-toggle="modal" data-bs-target="#modal-report" disabled><span>Pdsfsd</span></button>
                                                                        }


                                                                        {
                                                                            data?.status == "rejected" && <button className="btn btn-primary" style={{ padding: "4px 15px", fontSize: "12px" }} data-bs-toggle="modal" data-bs-target="#modal-report" disabled><span>Pdfsd</span></button>
                                                                        }


                                                                    </ul>
                                                                </div> */}

                                                                {/* ; documentVerifyedstatus(e) */}




                                                                {/* <div className="nk-tb-col nk-tb-col-tools">
                                                        <ul className="nk-tb-actions gx-1">

                                                            <li onClick={() => { setid(data.id) }}>
                                                                <div className="drodown"> */}
                                                                {/* <a className="dropdown-toggle btn btn-icon btn-trigger"
                                                                    data-bs-toggle="dropdown"
                                                                    ><em className="icon ni ni-more-h" /></a> */}
                                                                {/* <div className="dropdown-menu dropdown-menu-end">
                                                                        <ul className="link-list-opt no-bdr"> */}

                                                                {/* <li ><a ><em className="icon ni ni-eye" /><span style={{ cursor: "pointer" }}>View Details</span></a></li> */}
                                                                {/* <li style={{ color: "blue", cursor: "pointer" }} onClick={getCurrencyDatabyid} data-bs-toggle="modal" data-bs-target="#modal-reportUpdate" ><a ><em className="icon ni ni-edit" /><span style={{ cursor: "pointer" }}>Edit</span></a></li>
                                                                            <li onClick={handleDelete} style={{ color: "red", cursor: "pointer" }} ><a ><em className="icon ni ni-trash" /><span>Delete</span></a></li> */}
                                                                {/* <li className="divider" />
                                                                                        <li><a ><em className="icon ni ni-shield-star" /><span>Reset Pass</span></a></li>
                                                                                        <li><a ><em className="icon ni ni-shield-off" /><span>Reset 2FA</span></a></li>
                                                                                        <li><a ><em className="icon ni ni-na" /><span>Suspend User</span></a></li> */}
                                                                {/* </ul>
                                                                    </div> */}
                                                                {/* </div>
                                                            </li>
                                                        </ul>
                                                    </div> */}
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </>
                                    }

                                </div>
                                <div className="card">
                                    <div className="card-inner">
                                        <div className="nk-block-between-md g-3">
                                            <div className="g">
                                                {example == true &&
                                                    <ReactPaginate

                                                        previousLabel={"Previous"}
                                                        nextLabel={'Next'}
                                                        forcePage={pageNumber - 1}
                                                        breakLabel={"..."}
                                                        pageCount={totalSize}
                                                        marginPagesDisplayed={1}
                                                        pageRangeDisplayed={2}
                                                        onPageChange={Click}
                                                        containerClassName={'pagination justify-content-center'}
                                                        pageClassName={'page-item'}
                                                        pageLinkClassName={'page-link'}
                                                        previousClassName={'page-item'}
                                                        previousLinkClassName={'page-link'}
                                                        nextClassName={'page-item'}
                                                        nextLinkClassName={'page-link'}
                                                        breakClassName={"page-item"}
                                                        breakLinkClassName={'page-link'}
                                                        activeClassName={'active'}
                                                    />
                                                }
                                            </div>
                                            {/* <div className="g">
                                                <div className="pagination-goto d-flex justify-content-center justify-content-md-start gx-3">
                                                    <div>Page</div>
                                                    <div>
                                                        <select className="form-select js-select2" data-search="on" data-dropdown="xs center">
                                                            <option value="page-1">1</option>
                                                            <option value="page-2">2</option>
                                                            <option value="page-4">4</option>
                                                            <option value="page-5">5</option>
                                                            <option value="page-6">6</option>
                                                            <option value="page-7">7</option>
                                                            <option value="page-8">8</option>
                                                            <option value="page-9">9</option>
                                                            <option value="page-10">10</option>
                                                            <option value="page-11">11</option>
                                                            <option value="page-12">12</option>
                                                            <option value="page-13">13</option>
                                                            <option value="page-14">14</option>
                                                            <option value="page-15">15</option>
                                                            <option value="page-16">16</option>
                                                            <option value="page-17">17</option>
                                                            <option value="page-18">18</option>
                                                            <option value="page-19">19</option>
                                                            <option value="page-20">20</option>
                                                        </select>
                                                    </div>
                                                    <div>OF 102</div>
                                                </div>
                                            </div> */}
                                        </div>
                                    </div>
                                </div>{/* .card */}
                            </div>


                        </div>
                    </div>
                </div>
            </div>
            <div className="modal modal-blur fade" id="modal-report" tabIndex={-1} role="dialog" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Update Status</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" ref={ref2} data-dismiss="modal" />
                        </div>
                        <form onSubmit={form.handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group mb-3 row">
                                    <label className="form-label col-3 col-form-label">Status</label>
                                    <div className="col">


                                        {/* <select className="form-control mb-0" name="Title" style={{ height: 40 }}
                                            onChange={(e) => handleSelect(e)}>
                                            <option value="true">Complete</option>
                                            <option value="false">Reject</option>
                                        </select> */}


                                        <select className="form-control mb-0" name="role" {...form.getFieldProps("role")} style={{ height: 40 }}
                                        // onChange={(e) => handleChangeQueryBuilder(e)}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="true">Complete</option>
                                            <option value="false">Reject</option>

                                        </select>
                                        {form.errors.role && form.touched.role ? <p className='red' style={{ marginTop: 5 }}>{form.errors.role}</p> : null}

                                        {/* {form.touched.role && form.errors.role ?
                                            <div className="invalid-feedback" style={{ display: "block" }}>{form.errors.role}</div> : ''} */}
                                    </div>
                                </div>

                                <div className="form-group mb-3 row">
                                    <label className="form-label col-3 col-form-label">Message</label>
                                    <div className="col">
                                        <input type="text" className="form-control" aria-describedby="emailHelp" placeholder="Enter Message"
                                            name="ShortName" {...form.getFieldProps("ShortName")}
                                        />
                                        {form.errors.ShortName && form.touched.ShortName ? <p className='red' style={{ marginTop: 5 }}>{form.errors.ShortName}</p> : null}

                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary ms-auto" > Update
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>

        </Container>


    )
}

export default RequestMoney
