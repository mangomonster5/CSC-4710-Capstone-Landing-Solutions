

const AdminPage: React.FC = () => {

    return (
        <div className="d-flex flex-column gap-5" style={{ paddingLeft: '18vw', paddingRight: '18vw', marginTop: '12vh', marginBottom: '12vh' }}>
            <div className="d-flex">
                <div className="w-75 d-flex flex-column gap-1 text-start">
                    <h6 className="mb-0 fw-medium">Panther Cloud Air Admin Settings</h6>
                    <div>Monitor live flight status, adjust simulation days to evaluate system behavior, and track financial data to ensure performance targets are met</div>
                </div>
            </div>



            <div>
                <h5>Simulation Days</h5>
                <div className="d-flex bg-primary-blue-500 border-black text-white py-3 px-3 fw-medium rounded-top">

                </div>

            </div>

            <div className="d-flex gap-3">
                <div className="w-50">
                    <h5>Financial Report</h5>

                    {/* header */}
                    <div className="d-flex bg-primary-blue-500 border-black text-white py-3 px-4 fw-medium rounded-top justify-content-between">
                        <div className="px-1 bg-white border rounded text-black w-25 text-center">Overall Rev.</div>
                        <div className="fw-semibold w-25 text-center">Mo. Rev.</div>
                        <div className="fw-semibold w-25 text-center">Wk. Rev.</div>
                        <div className="fw-semibold w-25 text-center">Qd. Rev.</div>
                    </div>

                    <div style={{ height: '241px' }} className="border rounded-bottom border-dark d-flex justify-content-center align-items-center">
                        <div className="d-flex gap-1 flex-column">
                            <div>Total Revenue</div>
                            <div className="fw-semibold">$251,768,932</div>
                        </div>
                    </div>
                </div>
                <div className="w-50">
                    <h5>Aircraft Report</h5>
                    {/* header */}
                    <div className="d-flex bg-primary-blue-500 border-black text-white py-3 px-3 fw-medium rounded-top">
                        <div className="fw-semibold" style={{ width: '160px' }}>Plane #</div>
                        <div className="fw-semibold" style={{ width: '200px' }}>Status</div>
                        <div className="fw-semibold" style={{ width: '300px' }}>Needs Maintenance</div>
                        <div className="fw-semibold" style={{ width: '75px' }}></div>
                    </div>

                    <div className={`d-flex border-start border-end border-bottom border-dark py-3 px-3 fw-medium`}>
                        <div className="text-muted" style={{ width: '160px' }}>PCA908</div>
                        <div className="text-muted" style={{ width: '200px' }}>In-Flight</div>
                        <div className="text-muted" style={{ width: '300px' }}>In 20 Days</div>
                        <div className="text-muted text-center" style={{ width: '75px' }}>
                            <button className="rounded border">View</button>
                        </div>
                    </div>

                    <div className={`d-flex border-start border-end border-bottom border-dark py-3 px-3 fw-medium`}>
                        <div className="text-muted" style={{ width: '160px' }}>PCA771</div>
                        <div className="text-muted" style={{ width: '200px' }}>Taxing</div>
                        <div className="text-muted" style={{ width: '300px' }}>In 63 Days</div>
                        <div className="text-muted text-center" style={{ width: '75px' }}>
                            <button className="rounded border">View</button>
                        </div>
                    </div>

                    <div className={`d-flex border-start border-end border-bottom border-dark py-3 px-3 fw-medium`}>
                        <div className="text-muted" style={{ width: '160px' }}>PCA582</div>
                        <div className="text-muted" style={{ width: '200px' }}>Repair</div>
                        <div className="text-muted" style={{ width: '300px' }}>In 0 Days</div>
                        <div className="text-muted text-center" style={{ width: '75px' }}>
                            <button className="rounded border">View</button>
                        </div>
                    </div>

                    <div className={`d-flex border-start border-end border-bottom rounded-bottom border-dark py-3 px-3 fw-medium`}>
                        <div className="text-muted" style={{ width: '160px' }}>PCA120</div>
                        <div className="text-muted" style={{ width: '200px' }}>Take-Off</div>
                        <div className="text-muted" style={{ width: '300px' }}>In 42 Days</div>
                        <div className="text-muted text-center" style={{ width: '75px' }}>
                            <button className="rounded border">View</button>
                        </div>
                    </div>
                </div>

            </div>


        </div>
    );
}

export default AdminPage;