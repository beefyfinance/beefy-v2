const bold = {
    fontFamily: 'Proxima Nova',
    fontStyle: 'normal',
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
        padding: '20px'
    },
    cardActions: {
        margin: '10px'
    },
    cardContent: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#313759',
        borderRadius: '0 0 20px 20px',
        padding: '20px'
    },
    cardTitle: {
        fontFamily: 'Proxima Nova',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: '36px',
        lineHeight: '42px',
        letterSpacing: "-0.1px",
        color: "#E88225"
        
    },
    cardSubtitle: {
        fontFamily: 'Proxima Nova',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: '18px',
        lineHeight: '24px',
        color: '#8585A6',
        letterSpacing: '0.2px'
    },
    riskList: {},
    riskRow: {
        display: 'flex',
        flexDirection: "row",
        justifyContent: 'space-between'
    },
    risk: {
        fontFamily: "Proxima Nova",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: "24px",
        lineHeight: "30px",
        color: "#FFFFFF",
    },
    riskCategory: {
        fontFamily: "Proxima Nova",
        fontStyle: "normal",
        fontWeight: "normal",
        fontSize: "15px",
        lineHeight: "24px",
        letterSpacing: "0.2px",
        color: "#8585A6",
    },
    infoContainer: {
        display: 'flex',
        alignItems: "flex-start"
    },
    moreInfoContainer: {
        display: 'flex',
        alignItems: "center"
    },
    moreInfoLabel: {
        marginRight: "5px",
        fontFamily: "Proxima Nova",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: "14px",
        lineHeight: "24px",
        letterSpacing: "0.2px",
        color: "#6B7199",
    },
    moreInfoIcon: {
        
    },
    notes: {},
    arrow: {
        marginTop: "5px",
        marginRight: "8px"
    }
});

export default styles;
