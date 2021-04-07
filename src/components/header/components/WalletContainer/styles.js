const styles = (theme) => ({
    wallet: {
        marginTop: '4px',
        '& .on': {
            color: theme.palette.success.main,
        },
        '& .off': {
            color: theme.palette.error.main,
        },
        '& .MuiAvatar-root': {
            backgroundColor: 'transparent',
        },
        '& .MuiFormControl-root': {
            width: '138px',
            marginLeft: '5px',
        },
        '& .MuiOutlinedInput-input': {
            padding: '14px',
            paddingLeft: '32px',
        },
        '& .MuiInputBase-input': {
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
        }
    },
});

export default styles;
