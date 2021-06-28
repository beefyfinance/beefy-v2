const defaultFont = {
    fontFamily: 'Proxima Nova',
    fontStyle: 'normal',
}

const bold = {
    ...defaultFont,
    fontWeight: 600,
}

const styles = (theme) => ({
    cardContainer: {
        backgroundColor: 'transparent',
        marginTop: '20px'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#272B4A',
        borderRadius: '20px 20px 0 0',
        padding: '30px 32px 36px 32px'
    },
    cardActions: {
        display: 'flex'
    },
    cardAction: {
        marginLeft: '15px'
    },
    cardContent: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#313759',
        borderRadius: '0 0 20px 20px',
        padding: '30px 32px 36px 32px'
    },
    cardTitle: {
        ...bold,
        fontSize: '30px',
        lineHeight: '42px'
    },
    apysContainer: {
        marginBottom: '32px'
    },
    apys: {
        display: 'flex',
    },
    apyTitle: {
        ...bold,
        fontSize: "18px",
        lineHeight: "30px",
        marginBottom: "12px"
    },
    apy: {
        marginRight: "24px"
    },
    apyValue: {
        ...bold,
        fontSize: "24px",
        lineHeight: "30px"
    },
    apyLabel: {
        ...defaultFont,
        fontSize: '15px',
        lineHeight: '24px',
        letterSpacing: '0.2px',
        color: '#8585A6'
    },
    audits: {
        display: 'flex',
    },
    audit: {
        display: 'flex',
        marginRight: '50px',
        textDecoration: 'none',
        color: 'white'
    },
    auditIcon: {
        marginRight: '10px'
    },
    auditLabel: {
        ...bold
    },
    text: {
        fontFamily: 'Proxima Nova',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: '18px',
        lineHeight: '32px',
        marginBottom: '28px'
    }
});

export default styles;
